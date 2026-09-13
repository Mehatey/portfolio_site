import bpy, math, os, random
from mathutils import Vector

OUT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def mat(name,base,metal=0,rough=.4,emit=None,strength=0,trans=0,ior=1.45):
    m=bpy.data.materials.new(name);m.diffuse_color=(*base,1);m.use_nodes=True
    b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*base,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
    if 'Coat Weight' in b.inputs:b.inputs['Coat Weight'].default_value=.45
    if trans and 'Transmission Weight' in b.inputs:b.inputs['Transmission Weight'].default_value=trans
    if 'IOR' in b.inputs:b.inputs['IOR'].default_value=ior
    if emit:b.inputs['Emission Color'].default_value=(*emit,1);b.inputs['Emission Strength'].default_value=strength
    return m

glass=mat('Pearl ice glass',(.18,.42,.58),.04,.06,trans=.78,ior=1.47)
chrome=mat('Champagne chrome',(.52,.48,.42),.92,.08)
dark=mat('Smoked interior',(.008,.012,.018),.55,.18)
linen=mat('Soft white linen',(.84,.83,.78),0,.86)
linen_shadow=mat('Linen seam',(.54,.57,.56),0,.82)
knit=mat('Charcoal turtleneck',(.022,.030,.040),0,.82)
button_mat=mat('Mother of pearl buttons',(.88,.90,.87),.08,.24)
skin=mat('Light warm brown skin',(.66,.46,.34),0,.56)
skin_light=mat('Skin highlight',(.64,.42,.31),0,.47)
hair=mat('Black hair and beard',(.012,.009,.008),.02,.72)
eye_white=mat('Eye whites',(.82,.79,.72),0,.42)
iris=mat('Dark brown iris',(.10,.045,.018),.05,.25)
phosphor=mat('Soft robot phosphor',(.62,.90,1),.05,.12,(.35,.82,1),10)
phosphor_warm=mat('Warm robot phosphor',(1,.62,.25),.05,.14,(1,.35,.08),7)
idmat=mat('Parsons card',(.9,.88,.82),0,.45)
red=mat('Parsons red',(.76,.025,.03),.03,.35)
circuit=mat('Circuit substrate',(.012,.032,.036),.16,.38)
trace=mat('Luminous circuit trace',(.035,.52,.43),.42,.18,(.02,.82,.62),1.7)
copper=mat('Warm exposed copper',(.62,.20,.045),.78,.20,(.85,.12,.02),.18)
chip=mat('Smoked silicon',(.018,.022,.028),.48,.20)
soft_label=mat('Soft school label',(.30,.32,.33),.08,.66)
badge_plinth=mat('Badge black chrome',(.018,.020,.024),.88,.12)

# The scan already has clean UVs. Use its real pore normal map and restrained
# subsurface response instead of the toy-like perfectly smooth skin surface.
skin_bsdf=skin.node_tree.nodes.get('Principled BSDF')
if 'Subsurface Weight' in skin_bsdf.inputs:skin_bsdf.inputs['Subsurface Weight'].default_value=.075
if 'Subsurface Radius' in skin_bsdf.inputs:skin_bsdf.inputs['Subsurface Radius'].default_value=(1.0,.42,.22)
normal_path=os.path.join(OUT,'head-normal.jpg')
if os.path.exists(normal_path):
    normal_image=bpy.data.images.load(normal_path,check_existing=True);normal_image.colorspace_settings.name='Non-Color'
    normal_tex=skin.node_tree.nodes.new('ShaderNodeTexImage');normal_tex.image=normal_image;normal_tex.interpolation='Linear'
    normal_node=skin.node_tree.nodes.new('ShaderNodeNormalMap');normal_node.inputs['Strength'].default_value=.32
    skin.node_tree.links.new(normal_tex.outputs['Color'],normal_node.inputs['Color']);skin.node_tree.links.new(normal_node.outputs['Normal'],skin_bsdf.inputs['Normal'])

def rounded(name,loc,dims,bev,material,parent=None,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);m=o.modifiers.new('soft bevel','BEVEL');m.width=bev;m.segments=5;m.limit_method='ANGLE';bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
    for p in o.data.polygons:p.use_smooth=True
    o.data.materials.append(material)
    if parent:o.parent=parent
    return o

def sphere(name,loc,scale,material,parent=None,segments=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=32,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for p in o.data.polygons:p.use_smooth=True
    o.data.materials.append(material)
    if parent:o.parent=parent
    return o

def cylinder(name,loc,radius,depth,material,parent=None,rot=(0,0,0),vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.data.materials.append(material)
    for p in o.data.polygons:p.use_smooth=True
    b=o.modifiers.new('soft edge','BEVEL');b.width=min(radius*.12,.045);b.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
    if parent:o.parent=parent
    return o

def cable(name,pts,radius,material,parent=None):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=14;c.bevel_depth=radius;c.bevel_resolution=4
    s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
    for b,p in zip(s.bezier_points,pts):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);c.materials.append(material)
    if parent:o.parent=parent
    return o

def face_text(name,text,loc,size,material,parent):
    c=bpy.data.curves.new(name,'FONT');c.body=text;c.align_x='CENTER';c.align_y='CENTER';c.size=size;c.extrude=.012;c.bevel_depth=.002
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.name=name;o.location=loc;o.rotation_euler=(math.pi/2,0,0);c.materials.append(material);o.parent=parent;return o

def image_badge(name,path,loc,size,parent):
    image=bpy.data.images.load(path,check_existing=True)
    m=bpy.data.materials.new(name+' enamel');m.use_nodes=True
    nodes=m.node_tree.nodes;links=m.node_tree.links;b=nodes.get('Principled BSDF')
    tex=nodes.new('ShaderNodeTexImage');tex.image=image;tex.interpolation='Linear'
    links.new(tex.outputs['Color'],b.inputs['Base Color']);links.new(tex.outputs['Color'],b.inputs['Emission Color']);b.inputs['Emission Strength'].default_value=.22;b.inputs['Metallic'].default_value=.18;b.inputs['Roughness'].default_value=.2
    if 'Coat Weight' in b.inputs:b.inputs['Coat Weight'].default_value=1
    if 'Coat Roughness' in b.inputs:b.inputs['Coat Roughness'].default_value=.08
    rounded(name+'_PLINTH',(loc[0],loc[1]+.060,loc[2]),(size[0]*1.13,.10,size[1]*1.15),.055,badge_plinth,parent)
    bpy.ops.mesh.primitive_plane_add(size=1,location=loc,rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=name;o.scale=(size[0],size[1],1);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);o.parent=parent
    return o

def fitted_surface(source,name,predicate,material,parent,offset=.025):
    faces=[tuple(p.vertices) for p in source.data.polygons if all(predicate(source.data.vertices[i].co) for i in p.vertices)]
    used=sorted({i for f in faces for i in f});remap={old:new for new,old in enumerate(used)}
    verts=[source.data.vertices[i].co+source.data.vertices[i].normal*offset for i in used]
    mesh=bpy.data.meshes.new(name+' mesh');mesh.from_pydata(verts,[],[tuple(remap[i] for i in f) for f in faces]);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.parent=parent;o.location=source.location;o.scale=source.scale;o.rotation_euler=source.rotation_euler;mesh.materials.append(material)
    for p in mesh.polygons:p.use_smooth=True
    return o

def bake_projected_albedo(obj,source_path,output_path,final_material):
    if not os.path.exists(source_path) or not obj.data.uv_layers:return
    if os.path.exists(output_path):
        bake_img=bpy.data.images.load(output_path,check_existing=True)
        obj.data.materials.clear();obj.data.materials.append(final_material)
        final_nodes=final_material.node_tree.nodes;final_links=final_material.node_tree.links;final_bsdf=final_nodes.get('Principled BSDF');albedo=final_nodes.get('Sid baked albedo') or final_nodes.new('ShaderNodeTexImage');albedo.name='Sid baked albedo';albedo.image=bake_img;albedo.interpolation='Linear';final_links.new(albedo.outputs['Color'],final_bsdf.inputs['Base Color'])
        return
    source=bpy.data.images.load(source_path,check_existing=True)
    projected=bpy.data.materials.new('Sid projected reference');projected.use_nodes=True
    nodes=projected.node_tree.nodes;links=projected.node_tree.links;bsdf=nodes.get('Principled BSDF')
    coord=nodes.new('ShaderNodeTexCoord');sep=nodes.new('ShaderNodeSeparateXYZ');combine=nodes.new('ShaderNodeCombineXYZ');tex=nodes.new('ShaderNodeTexImage');tex.image=source;tex.interpolation='Linear';tex.extension='EXTEND'
    links.new(coord.outputs['Generated'],sep.inputs[0]);links.new(sep.outputs['X'],combine.inputs['X']);links.new(sep.outputs['Z'],combine.inputs['Y']);links.new(combine.outputs[0],tex.inputs['Vector']);links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
    bake_img=bpy.data.images.new('Sid face baked albedo',width=1536,height=1536,alpha=False,float_buffer=False)
    target=nodes.new('ShaderNodeTexImage');target.image=bake_img
    for node in nodes: node.select=False
    nodes.active=target;target.select=True
    obj.data.materials.clear();obj.data.materials.append(projected);bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=1;scene.render.bake.use_clear=True;scene.render.bake.margin=12
    bpy.ops.object.bake(type='DIFFUSE',pass_filter={'COLOR'});bake_img.filepath_raw=output_path;bake_img.file_format='PNG';bake_img.save()
    obj.data.materials.clear();obj.data.materials.append(final_material)
    final_nodes=final_material.node_tree.nodes;final_links=final_material.node_tree.links;final_bsdf=final_nodes.get('Principled BSDF');albedo=final_nodes.get('Sid baked albedo') or final_nodes.new('ShaderNodeTexImage');albedo.name='Sid baked albedo';albedo.image=bake_img;albedo.interpolation='Linear';final_links.new(albedo.outputs['Color'],final_bsdf.inputs['Base Color'])

root=bpy.data.objects.new('SID_CHARACTER',None);bpy.context.collection.objects.link(root)
body=bpy.data.objects.new('Body_Root',None);bpy.context.collection.objects.link(body);body.parent=root
head=bpy.data.objects.new('Head_Root',None);bpy.context.collection.objects.link(head);head.parent=root;head.location=(0,0,3.58)

# Quiet turtleneck body. One uninterrupted knit volume keeps attention on the
# translucent head instead of reading as a tuxedo or character costume.
rounded('TURTLENECK_TORSO',(0,.12,.88),(2.08,.82,1.98),.38,knit,body)
cylinder('TURTLENECK_COLLAR',(0,-.01,2.02),.42,.52,knit,body,vertices=64)
cylinder('HUMAN_NECK',(0,-.02,2.32),.28,.28,skin,body)

# Awards are single uninterrupted enamel planes. No chrome slabs cutting their art.
image_badge('WEBBY_BADGE',os.path.join(OUT,'badge-webby.webp'),(-.55,-.345,1.30),(.70,.39),body)
image_badge('KYOORIUS_BADGE',os.path.join(OUT,'badge-kyoorius.png'),(.24,-.345,1.30),(.62,.42),body)

# Open stomach hardware: one recessed board, readable components, exposed copper
# tails, and restrained luminous traces. Designed, not robotic clutter.
rounded('CIRCUIT_PANEL',(0,-.345,.53),(1.42,.075,.68),.085,circuit,body)
rounded('CIRCUIT_CORE',(0,-.405,.54),(.30,.045,.22),.035,chip,body)
for side in (-1,1):
    rounded(f'CIRCUIT_CHIP_{side}',(side*.43,-.405,.55),(.22,.045,.17),.025,chrome,body)
    cylinder(f'CIRCUIT_NODE_{side}',(side*.62,-.425,.38),.055,.035,trace,body,rot=(math.pi/2,0,0),vertices=24)
cable('CIRCUIT_TRACE_L',[(-.64,-.42,.70),(-.43,-.43,.62),(-.15,-.43,.56)],.014,trace,body)
cable('CIRCUIT_TRACE_R',[(.64,-.42,.70),(.43,-.43,.62),(.15,-.43,.56)],.014,trace,body)
cable('CIRCUIT_BUS',[(-.55,-.42,.35),(0,-.43,.30),(.55,-.42,.35)],.012,trace,body)
face_text('NEW_SCHOOL_LABEL','THE NEW SCHOOL  ·  SIDDHARTH MEHTA',(0,-.37,.03),.050,soft_label,body)

# Clean optical cube. No Kinect rail, buttons, headphones, or cable clutter.
rounded('CUBE_GLASS',(0,0,0),(2.30,2.30,2.30),.24,glass,head)
rounded('CUBE_INNER_SHADOW',(0,.89,0),(1.84,.10,1.84),.18,dark,head)
for x in (-1.05,1.05):
    for z in (-1.05,1.05):cylinder(f'CUBE_EDGE_{x}_{z}',(x,0,z),.028,2.04,chrome,head,rot=(math.pi/2,0,0),vertices=24)

# Human likeness layer. Start from the licensed Lee Perry-Smith scan already
# shipped in this project, then reshape it toward Sid's photographed proportions.
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(OUT,'placeholder-head.glb'))
imported=[o for o in bpy.data.objects if o not in before]
scan=next((o for o in imported if o.type=='MESH' and 'LeePerrySmith' in o.name),None)
for o in imported:
    if o is not scan:bpy.data.objects.remove(o,do_unlink=True)
if scan:
    # Seat the internal bust on the cube's lower optical shelf so the human
    # layer reads as a head on the character's neck, not a floating specimen.
    scan.name='FACE_HEAD_REAL';scan.parent=head;scan.location=(0,-.36,-.56);scan.scale=(.154,.162,.148)
    scan.data.materials.clear();scan.data.materials.append(skin)
    for p in scan.data.polygons:p.use_smooth=True
    # Likeness pass from Sid's front, three-quarter and profile reference:
    # narrower lower skull, fuller cheek plane, slightly taller forehead.
    for v in scan.data.vertices:
        z=v.co.z;x=v.co.x
        if z<-1.0:v.co.x*=.92
        elif z>.9:v.co.x*=.965
        if -.7<z<.8:v.co.y*=1.035
    scan.shape_key_add(name='Basis')
    smile=scan.shape_key_add(name='Smile')
    brow=scan.shape_key_add(name='BrowUp')
    jaw=scan.shape_key_add(name='JawOpen')
    for i,v in enumerate(scan.data.vertices):
        x,y,z=v.co
        front=max(0,min(1,(-y-1.0)/1.35))
        if front and -1.35<z<-.12 and abs(x)<2.25:
            smile.data[i].co.z+=front*(.06+.18*min(1,abs(x)/2.0))
            smile.data[i].co.y-=front*.055
        if front and .45<z<1.65 and abs(x)<2.55:
            brow.data[i].co.z+=front*.18*(1-abs(x)/2.8)
        if front and z<-.48 and abs(x)<2.05:
            jaw.data[i].co.z-=front*.22
            jaw.data[i].co.y-=front*.045

    # Browser applies a camera-facing PBR projection from Sid's reference.
    # Keep the exported scan neutral so invalid side angles never inherit a
    # stretched photographic texture.

for side in (-1,1):rounded(f'ROBOT_EYE_{side}',(side*.39,-1.17,.14),(.44,.035,.10),.05,phosphor,head)
rounded('ROBOT_MOUTH',(0,-1.18,-.30),(.20,.032,.035),.018,phosphor_warm,head)

scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=180;scene.render.fps=30
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'sid-tv-character.blend'))
bpy.ops.object.select_all(action='DESELECT');root.select_set(True)
for o in root.children_recursive:o.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'sid-tv-character.glb'),export_format='GLB',use_selection=True,export_animations=False,export_materials='EXPORT',export_yup=True,export_apply=False)
print('EXPORTED',os.path.join(OUT,'sid-tv-character.glb'))
