def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    old_slot = "<View style={[styles.forwardSlot, nextDisabled && { opacity: 0.5, pointerEvents: 'none' }]}>"
    new_slot = "<View style={[styles.forwardSlot, nextDisabled && { opacity: 0.5 }]} pointerEvents={nextDisabled ? 'none' : 'auto'}>"
    
    content = content.replace(old_slot, new_slot)
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('mobile/src/components/StepFooterNav.tsx')
