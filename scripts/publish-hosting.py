"""Publish the canonical contact repository using the signed-in AWS CLI session.

Does not modify DNS, credentials, the DJ admin branch, or form delivery.
"""
import json
import pathlib
import subprocess
import sys
import tempfile
import time
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
APP = 'd9jfcx3xw2ucx'
BRANCH = 'contact'
REGION = 'us-east-2'


def aws(service, operation, **params):
    command = ['aws', service, operation, '--region', REGION, '--output', 'json']
    if params:
        command += ['--cli-input-json', json.dumps(params)]
    return json.loads(subprocess.check_output(command, text=True))


if __name__ == '__main__':
    if aws('sts', 'get-caller-identity')['Account'] != '242088067567':
        sys.exit('Wrong AWS project; no release published.')
    if subprocess.check_output(['git', '-C', str(root), 'status', '--porcelain'], text=True).strip():
        sys.exit('Commit source changes before publishing a traceable release.')
    with tempfile.TemporaryDirectory(prefix='ogvhs-contact-') as tmp:
        bundle = pathlib.Path(tmp) / 'site.zip'
        subprocess.run([sys.executable, str(root / 'scripts/build-hosting.py'), str(bundle)], check=True)
        deployment = aws('amplify', 'create-deployment', appId=APP, branchName=BRANCH)
        request = urllib.request.Request(deployment['zipUploadUrl'], data=bundle.read_bytes(), method='PUT', headers={'Content-Type': 'application/zip'})
        with urllib.request.urlopen(request, timeout=60) as response:
            if response.status != 200:
                sys.exit('Release upload failed; deployment not started.')
        aws('amplify', 'start-deployment', appId=APP, branchName=BRANCH, jobId=deployment['jobId'])
        for _ in range(60):
            job = aws('amplify', 'get-job', appId=APP, branchName=BRANCH, jobId=deployment['jobId'])['job']['summary']
            if job['status'] == 'SUCCEED':
                print(json.dumps({'jobId': job['jobId'], 'status': job['status'], 'url': 'https://contact.ogvhs.com/'}))
                break
            if job['status'] in ('FAILED', 'CANCELLED'):
                sys.exit('Amplify deployment failed: ' + job['status'])
            time.sleep(10)
        else:
            sys.exit('Deployment still running; inspect the Amplify job before retrying.')
