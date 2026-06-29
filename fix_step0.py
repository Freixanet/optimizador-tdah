def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    old_step0 = """        {session.currentStep === 0 ? (
          <StepFooterGlassButton"""
    new_step0 = """        {session.currentStep === 0 ? (
          <View style={[nextDisabled && { opacity: 0.5 }]} pointerEvents={nextDisabled ? 'none' : 'auto'}>
            <StepFooterGlassButton"""
    
    old_step0_end = """            icon={<ArrowRight size={20} color="#fff" />}
          />
        ) : ("""
    new_step0_end = """            icon={<ArrowRight size={20} color="#fff" />}
            />
          </View>
        ) : ("""
        
    content = content.replace(old_step0, new_step0).replace(old_step0_end, new_step0_end)
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('mobile/src/components/StepFooterNav.tsx')
