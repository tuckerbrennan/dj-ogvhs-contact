# AWS contact hosting

Source of truth remains this repository. Build a release with:

```sh
python3 scripts/build-hosting.py /tmp/ogvhs-contact.zip
```

From a clean committed checkout, publish using the signed-in AWS CLI v2 session:

```sh
python3 scripts/publish-hosting.py
```

The publisher verifies the AWS project, deploys only the contact branch and waits for the job result. It does not change DNS or submit forms.

Hosting uses a dedicated `contact` branch in the existing manually published OGVHS Amplify application `d9jfcx3xw2ucx`, in Ohio (`us-east-2`). The existing `staging` branch serves the private DJ dashboard; do not redeploy or alter that branch. Admin authorization remains enforced by Cognito and its API.

Publish this ZIP with Amplify CreateDeployment, PUT to the returned zipUploadUrl, then StartDeployment with the returned jobId. Wait for SUCCEED and verify the build marker, page assets and unchanged form configuration at the generated contact hostname before switching contact.ogvhs.com.

Only index.html, contact-config.json, src/ and public/ are packaged. Git metadata and operational documentation are excluded. Formspree remains the submission backend until an AWS replacement has verified end-to-end delivery.

Rollback: apply `aws/dns-rollback.json` in the existing OGVHS Route 53 zone. It atomically removes the AWS alias and restores the saved CNAME to tuckerbrennan.github.io. Do not change nameservers or other subdomains. GitHub Pages source remains available.

## November 17 cutover

The AWS preview and the custom-host TLS endpoint were verified before changing traffic. The HTML release marker identifies commit eac1f8e5f1f1534f35690d9ddc1a56f60a1c0da3; the deployed form JavaScript and configuration matched committed files byte for byte. Contact now uses an A alias to d8ekom0ef2sh2.cloudfront.net. The form still posts to the existing Formspree endpoint; no messages were sent as part of deployment verification.

The domain uses an ACM-managed wildcard certificate attached as a custom Amplify certificate. ACM manages its private key and renewal. Its DNS validation record must remain. This was necessary because the old GitHub Pages CNAME inherits certificate-issuer restrictions; no live mail, admin, listener, archive or collaboration records were changed for this cutover.
