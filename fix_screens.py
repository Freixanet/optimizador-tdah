import re

def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Add imports
    content = content.replace("import React, { useCallback, useEffect, useMemo } from 'react';", "import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';")
    content = content.replace("import React, { useCallback, useMemo } from 'react';", "import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';")

    # 2. Add state and refs inside the component
    state_code = """
  const scrollProgress = useSharedValue(0);
  const headerVisible = useSharedValue(true);
  const lastScrollY = useSharedValue(0);

  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const scrollViewHeightRef = useRef<number>(0);

  useEffect(() => {
    setHasReachedBottom(false);
  }, [session.currentStep, session.viewAll]);
"""
    content = re.sub(r'const scrollProgress = useSharedValue\(0\);', state_code, content)

    # 3. Replace the scroll handler
    old_scroll_handler = """  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        const maxScroll = event.contentSize.height - event.layoutMeasurement.height;
        scrollProgress.value =
          maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, event.contentOffset.y / maxScroll));
        runOnJS(reportScrollSpy)(event.contentOffset.y, event.contentSize.height);
      },
    },
    [reportScrollSpy]
  );"""

    new_scroll_handler = """  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        const currentY = event.contentOffset.y;
        const maxScroll = event.contentSize.height - event.layoutMeasurement.height;
        const isNearBottom = currentY >= maxScroll - 30;

        if (currentY > lastScrollY.value + 5 && currentY > 50) {
          headerVisible.value = false;
        } else if ((currentY < lastScrollY.value - 5 || currentY <= 50) && !isNearBottom) {
          headerVisible.value = true;
        }
        lastScrollY.value = currentY;

        if (maxScroll <= 20 || isNearBottom) {
          runOnJS(setHasReachedBottom)(true);
        }

        scrollProgress.value =
          maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, currentY / maxScroll));
        runOnJS(reportScrollSpy)(currentY, event.contentSize.height);
      },
    },
    [reportScrollSpy]
  );

  const handleScrollViewLayout = (e: any) => {
    scrollViewHeightRef.current = e.nativeEvent.layout.height;
  };

  const handleContentSizeChange = (w: number, h: number) => {
    const layoutH = scrollViewHeightRef.current;
    if (layoutH > 0 && h - layoutH <= 20) {
      setHasReachedBottom(true);
    }
  };"""
    content = content.replace(old_scroll_handler, new_scroll_handler)

    # 4. Pass props to ReadingProgressBar
    reading_progress_bar_old = """          scrollProgressShared={scrollProgress}
          onToggleSidebar={() => session.toggleHistoryDrawer()}"""
    reading_progress_bar_new = """          scrollProgressShared={scrollProgress}
          headerVisibleShared={headerVisible}
          hideProgressLine={!session.viewAll && !session.isComplete && session.currentStep === 0}
          onToggleSidebar={() => session.toggleHistoryDrawer()}"""
    content = content.replace(reading_progress_bar_old, reading_progress_bar_new)

    # 5. Update ScrollView
    scroll_view_old = """        <Animated.ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-6 pb-32"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={!isIntroStep}
          scrollEnabled={!session.historyOpen}
          onScroll={scrollHandler}"""
    
    scroll_view_new = """        <Animated.ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-[76px] pb-32"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={!isIntroStep}
          scrollEnabled={!session.historyOpen}
          onLayout={handleScrollViewLayout}
          onContentSizeChange={handleContentSizeChange}
          onScroll={scrollHandler}"""
    content = content.replace(scroll_view_old, scroll_view_new)

    # Update for ResultScreen (which has pb-8 instead of pb-32)
    scroll_view_old_2 = """        <Animated.ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-6 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={!isIntroStep}
          scrollEnabled={!session.historyOpen}
          onScroll={scrollHandler}"""
    
    scroll_view_new_2 = """        <Animated.ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-[76px] pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={!isIntroStep}
          scrollEnabled={!session.historyOpen}
          onLayout={handleScrollViewLayout}
          onContentSizeChange={handleContentSizeChange}
          onScroll={scrollHandler}"""
    content = content.replace(scroll_view_old_2, scroll_view_new_2)

    # 6. Pass nextDisabled to StepFooterNav
    content = content.replace(
        '<StepFooterNav completeLabel="Finalizar" />',
        '<StepFooterNav completeLabel="Finalizar" nextDisabled={!hasReachedBottom} />'
    )
    content = content.replace(
        '<StepFooterNav />',
        '<StepFooterNav nextDisabled={!hasReachedBottom} />'
    )

    with open(filepath, 'w') as f:
        f.write(content)

fix('mobile/src/screens/classic/ClassicResultScreen.tsx')
fix('mobile/src/screens/ResultScreen.tsx')
print("Successfully fixed screens")
