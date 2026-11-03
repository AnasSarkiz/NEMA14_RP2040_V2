"""Correct native circular trace keepouts, without changing any rule.

The bundled CLI contains the same checker. Preserve package versions and exact
before/after hashes in a receipt; refuse to patch an unfamiliar implementation.
"""
import hashlib,json,pathlib,re
root=pathlib.Path(__file__).resolve().parents[1]
paths=[root/'node_modules/@tscircuit/checks/dist/index.js',root/'node_modules/@tscircuit/cli/dist/cli/main.js']
expression="""obj.type === "pcb_keepout" && obj.shape === "circle" ? (() => {
        const dx = segmentA.x2 - segmentA.x1, dy = segmentA.y2 - segmentA.y1;
        const lengthSquared = dx * dx + dy * dy;
        const t = lengthSquared ? Math.max(0, Math.min(1, ((obj.center.x - segmentA.x1) * dx + (obj.center.y - segmentA.y1) * dy) / lengthSquared)) : 0;
        return Math.hypot(obj.center.x - segmentA.x1 - t * dx, obj.center.y - segmentA.y1 - t * dy) - obj.radius - segmentA.thickness / 2;
      })() : """
rows=[]
previous_path=root/'artifacts/upright-revision/native-circle-checker.json'
previous=json.loads(previous_path.read_text()).get('packages',[]) if previous_path.exists() else []
for path in paths:
 s=path.read_text();before=hashlib.sha256(s.encode()).hexdigest()
 pattern=r'const gap = (segmentToBoundsMinDistance\(\s*\{ x: segmentA.x1, y: segmentA.y1 \},\s*\{ x: segmentA.x2, y: segmentA.y2 \},\s*getCollidableBounds\(obj\)\s*\) - segmentA.thickness / 2);'
 if expression not in s:
  s,count=re.subn(pattern,lambda m:'const gap = '+expression+m.group(1)+';',s)
  assert count==1,(str(path),'Unrecognized native checker',count)
  path.write_text(s)
 prior=next((r for r in previous if r['package_path']==str(path.relative_to(root))),{})
 rows.append(dict(package_path=str(path.relative_to(root)),before_sha256=prior.get('before_sha256',before) if prior.get('after_sha256')==before else before,package_version=json.loads((root.joinpath(*path.relative_to(root).parts[:3])/'package.json').read_text())['version'],after_sha256=hashlib.sha256(s.encode()).hexdigest(),exact_circle_distance_enabled=True))
out=root/'artifacts/upright-revision/native-circle-checker.json'
out.write_text(json.dumps(dict(rule_clearance_unchanged=True,errors_suppressed=False,implementation='Analytic clamped point-to-segment distance minus circle radius and half trace width',packages=rows),indent=2)+'\n')
print('Exact circular keepout checks enabled in native checks and CLI')
