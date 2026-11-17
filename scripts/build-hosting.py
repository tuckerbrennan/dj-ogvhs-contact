"""Package only the public contact site for Amplify manual hosting."""
import argparse
import pathlib
import subprocess
import zipfile

root = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('output', type=pathlib.Path)
args = parser.parse_args()
commit = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
files = [root / 'index.html', root / 'contact-config.json']
files += [p for folder in ('src', 'public') for p in (root / folder).rglob('*') if p.is_file()]
args.output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(files):
        name = path.relative_to(root).as_posix()
        content = path.read_bytes()
        if name == 'index.html':
            content = content.replace(b'</body>', f'<!-- OGVHS_AWS_CONTACT_BUILD {commit} -->\n</body>'.encode())
        archive.writestr(name, content)
print(f'Packaged {len(files)} public files from {commit}')
