"""Shared flat-band emission material (the look everything renders through)."""
import bpy


def cel_material(src, light):
    m = bpy.data.materials.new(src.name + "_C"); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    img = None
    for n in src.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image and 'basecolor' in n.image.name:
            img = n.image
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(em.outputs['Emission'], o.inputs['Surface'])
    if img is None:
        em.inputs['Color'].default_value = (0.7, 0.7, 0.7, 1)
        return m
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.interpolation = 'Smart'
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'
    dot.inputs[1].default_value = tuple(light)
    nt.links.new(geo.outputs['Normal'], dot.inputs[0])
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'CONSTANT'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
    ramp.color_ramp.elements[1].position = 0.30
    ramp.color_ramp.elements[1].color = (0.5, 0.5, 0.5, 1)
    ramp.color_ramp.elements.new(0.62).color = (1, 1, 1, 1)
    nt.links.new(dot.outputs['Value'], ramp.inputs['Fac'])
    dk = nt.nodes.new('ShaderNodeMix'); dk.data_type = 'RGBA'; dk.blend_type = 'MULTIPLY'
    dk.inputs['Factor'].default_value = 1.0
    nt.links.new(tex.outputs['Color'], dk.inputs[6])
    dk.inputs[7].default_value = (0.46, 0.50, 0.68, 1.0)
    md = nt.nodes.new('ShaderNodeMix'); md.data_type = 'RGBA'; md.blend_type = 'MULTIPLY'
    md.inputs['Factor'].default_value = 1.0
    nt.links.new(tex.outputs['Color'], md.inputs[6])
    md.inputs[7].default_value = (0.80, 0.82, 0.90, 1.0)
    b1 = nt.nodes.new('ShaderNodeMix'); b1.data_type = 'RGBA'
    nt.links.new(ramp.outputs['Color'], b1.inputs['Factor'])
    nt.links.new(dk.outputs[2], b1.inputs[6]); nt.links.new(md.outputs[2], b1.inputs[7])
    st = nt.nodes.new('ShaderNodeMath'); st.operation = 'GREATER_THAN'
    st.inputs[1].default_value = 0.62
    nt.links.new(dot.outputs['Value'], st.inputs[0])
    b2 = nt.nodes.new('ShaderNodeMix'); b2.data_type = 'RGBA'
    nt.links.new(st.outputs['Value'], b2.inputs['Factor'])
    nt.links.new(b1.outputs[2], b2.inputs[6]); nt.links.new(tex.outputs['Color'], b2.inputs[7])
    nt.links.new(b2.outputs[2], em.inputs['Color'])
    return m
