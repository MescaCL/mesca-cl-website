import pathlib
root=pathlib.Path( C:/Users/mesca/Documents/Mesca CL)
bad=[]
for p in root.rglob(*.tsx):
 if node_modules in p.parts or .next in p.parts: continue
 try: t=p.read_text(encoding=utf-8)
 except Exception as e: bad.append((str(p.relative_to(root)),str(e))); continue
 if \ufffd in t: bad.append((str(p.relative_to(root)),replacement char))
print(bad)
