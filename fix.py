def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("import React, { useState, useRef, useEffect } { useCallback, useEffect, useMemo } from 'react';", "import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';")
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('mobile/src/screens/classic/ClassicResultScreen.tsx')
fix('mobile/src/screens/ResultScreen.tsx')
