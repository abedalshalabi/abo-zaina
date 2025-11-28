import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SimpleCarousel3DProps {
  children: React.ReactNode[];
  autoplay?: boolean;
  rtl?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
  onSlideChange?: (index: number) => void;
  slideDimensions?: {
    smallMobile: { width: number; height: number; spacing: number };
    mobile: { width: number; height: number; spacing: number };
    desktop: { width: number; height: number; spacing: number };
  };
}

const SimpleCarousel3D: React.FC<SimpleCarousel3DProps> = ({
  children,
  autoplay = false,
  rtl = false,
  showNavigation = true,
  showPagination = true,
  onSlideChange,
  slideDimensions = {
    smallMobile: { width: 140, height: 200, spacing: 15 },
    mobile: { width: 220, height: 280, spacing: 30 },
    desktop: { width: 280, height: 280, spacing: 50 }
  },
}) => {
  // إنشاء نسخ من العناصر للـ endless loop مع زيادة عدد النسخ لتغطية المساحة
  const extendedChildren = React.useMemo(() => {
    if (!children || children.length === 0) return [];
    
    // تحويل الأطفال إلى مصفوفة للتعامل معها
    const arr = React.Children.toArray(children);
    if (arr.length === 0) return [];
    
    // نحتاج لنسختين على الأقل في كل جانب لضمان عدم ظهور فراغات عند الانتقال
    // إذا كانت المصفوفة صغيرة جداً (عنصر واحد)، نكررها عدة مرات
    let clonesBefore: React.ReactNode[] = [];
    let clonesAfter: React.ReactNode[] = [];
    
    if (arr.length === 1) {
        // [A] -> [A, A, A, A, A]
        clonesBefore = [arr[0], arr[0]];
        clonesAfter = [arr[0], arr[0]];
    } else {
        // [A, B, C] -> [B, C, A, B, C, A, B]
        // نسخ آخر عنصرين للبداية
        const lastTwo = arr.slice(-2);
        // إذا كان هناك أقل من عنصرين، نأخذ ما هو متاح
        clonesBefore = lastTwo.length < 2 ? [...arr, ...arr].slice(-2) : lastTwo;
        
        // نسخ أول عنصرين للنهاية
        const firstTwo = arr.slice(0, 2);
        clonesAfter = firstTwo.length < 2 ? [...arr, ...arr].slice(0, 2) : firstTwo;
    }
    
    return [...clonesBefore, ...arr, ...clonesAfter];
  }, [children]);

  // بدء السلايدر من أول عنصر حقيقي (وهو في الموقع 2 لأننا أضفنا عنصرين في البداية)
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResetting, setIsResetting] = useState(false); // حالة لتعطيل الانتقال أثناء إعادة تعيين السلايدر
  const containerRefForLoop = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Mouse drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragCurrentX = useRef<number>(0);
  const dragVelocity = useRef<number>(0);
  const lastDragTime = useRef<number>(0);
  const lastDragX = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState({});
  const dragStartIndex = useRef<number>(0);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null);
  const userInteracted = useRef(false);

  // Track user interaction to enable audio/vibration
  useEffect(() => {
    const enableInteractions = () => {
      userInteracted.current = true;
    };

    // Listen for any user interaction
    const events = ['touchstart', 'mousedown', 'keydown', 'click'];
    events.forEach(event => {
      document.addEventListener(event, enableInteractions, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, enableInteractions);
      });
    };
  }, []);

  const playTickSound = useCallback(async () => {
    // Only play sound/vibration after user interaction
    if (!userInteracted.current) {
      return;
    }

    // Haptic feedback for mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10); // اهتزاز خفيف جداً لمدة 10ms
      } catch (error) {
        // Ignore vibration errors
      }
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Resume audio context if suspended
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      // صوت "نقرة" عصرية (أكثر حدة وأقصر)
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // مستوى صوت مناسب
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (error) {
      // Ignore audio errors (e.g. if not supported or blocked)
    }
  }, []);

  const isInitialMount = useRef(true);

  // Call onSlideChange when currentIndex updates
  useEffect(() => {
    if (children.length > 0) {
      // Skip sound on initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
      } else if (!isResetting) {
        // Play sound on index change (unless resetting)
        playTickSound();
      }

      if (onSlideChange) {
      // حساب الفهرس الحقيقي بناءً على القائمة الممتدة
      // العناصر الحقيقية تبدأ من الفهرس 2
      let realIndex = currentIndex - 2;
      
      // التعامل مع الحدود والنطاقات
      const totalReal = React.Children.count(children);
      
      // تصحيح الفهرس إذا كان سالباً (في منطقة النسخ الأمامية)
      while (realIndex < 0) {
        realIndex += totalReal;
      }
      
      // تصحيح الفهرس إذا كان أكبر (في منطقة النسخ الخلفية)
      while (realIndex >= totalReal) {
        realIndex -= totalReal;
      }
      
      onSlideChange(realIndex);
      }
    }
  }, [currentIndex, children, onSlideChange, isResetting, playTickSound]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (isTransitioning || isDragging) return;
    
    // إلغاء أي timeout سابق
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    setIsTransitioning(true);
    
    setCurrentIndex((prev) => {
      const next = prev + 1;
      // إذا وصلنا إلى أول نسخة في النهاية (index = length - 2)
      // نسمح بالانتقال إليها ثم نعيد التعيين للبداية الحقيقية
      if (next >= extendedChildren.length - 2) {
        // بعد الانتقال، ننتقل فوراً إلى العنصر الأول الحقيقي (index 2) بدون انتقال
        transitionTimeoutRef.current = setTimeout(() => {
          setIsResetting(true);
          // الانتقال للعنصر المقابل في البداية
          // العنصر عند extendedChildren.length - 2 هو نسخة من العنصر الأول الحقيقي (index 2)
          setCurrentIndex(2);
          setIsTransitioning(false);
          setTimeout(() => {
            setIsResetting(false);
          }, 50);
        }, 500);
        return next;
      }
      // الانتقال العادي
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return next;
    });
  }, [isTransitioning, isDragging, extendedChildren.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || isDragging) return;
    
    // إلغاء أي timeout سابق
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    setIsTransitioning(true);
    
    setCurrentIndex((prev) => {
      const next = prev - 1;
      // إذا وصلنا إلى آخر نسخة في البداية (index = 1)
      // نسمح بالانتقال إليها ثم نعيد التعيين للنهاية الحقيقية
      if (next <= 1) {
        // بعد الانتقال، ننتقل فوراً إلى العنصر الأخير الحقيقي
        transitionTimeoutRef.current = setTimeout(() => {
          setIsResetting(true);
          // الانتقال للعنصر المقابل في النهاية
          // العنصر عند index 1 هو نسخة من العنصر الأخير الحقيقي
          // آخر عنصر حقيقي يقع عند extendedChildren.length - 3
          setCurrentIndex(extendedChildren.length - 3);
          setIsTransitioning(false);
          setTimeout(() => {
            setIsResetting(false);
          }, 50);
        }, 500);
        return next;
      }
      // الانتقال العادي
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return next;
    });
  }, [isTransitioning, isDragging, extendedChildren.length]);

  const goToSlide = (index: number) => {
    if (isTransitioning || isDragging) return;
    
    // إلغاء أي timeout سابق
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    setIsTransitioning(true);
    // تحويل الفهرس من القائمة الأصلية للقائمة الممتدة (إضافة 2 للنسخ في البداية)
    const extendedIndex = index + 2;
    setCurrentIndex(extendedIndex);
    transitionTimeoutRef.current = setTimeout(() => setIsTransitioning(false), 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Autoplay effect - must be after nextSlide and prevSlide are defined
  useEffect(() => {
    if (autoplay && extendedChildren.length > 0 && !isDragging) {
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, autoplay, extendedChildren.length, isDragging, nextSlide]);


  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Enable audio/vibration on interaction
    userInteracted.current = true;
    
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragCurrentX.current = e.clientX;
    lastDragX.current = e.clientX;
    lastDragTime.current = Date.now();
    dragVelocity.current = 0;
    dragStartIndex.current = currentIndex;
    
    if (containerRef.current) {
      containerRef.current.style.userSelect = 'none';
    }
    
    e.preventDefault();
  };

  // Function to update current index based on drag distance with smooth snapping
  const updateIndexFromDrag = useCallback((dragDistance: number) => {
    const isMobile = windowWidth <= 768;
    const isSmallMobile = windowWidth <= 480;
    
    // تعديل الأبعاد لتظهر 3 عناصر في الموبايل
    const slideWidth = isSmallMobile ? 140 : isMobile ? 220 : 280;
    const spacing = isSmallMobile ? 15 : isMobile ? 30 : 50;
    const slideSize = slideWidth + spacing;
    
    // Use a threshold (30% of slide size) before changing index for smoother transitions
    const threshold = slideSize * 0.3;
    const absDistance = Math.abs(dragDistance);
    
    // Only update index if we've moved past the threshold
    if (absDistance < threshold) {
      return;
    }
    
    // Calculate how many slides to move based on drag distance
    // عكس الاتجاه: سحب لليمين = حركة لليمين (زيادة الفهرس في LTR، تقليل في RTL)
    const slidesMoved = Math.round(dragDistance / slideSize);
    // في RTL، نعكس الاتجاه لأن translateX معكوس
    const adjustedSlidesMoved = rtl ? -slidesMoved : slidesMoved;
    let newIndex = dragStartIndex.current - adjustedSlidesMoved;
    
    // Update index smoothly without triggering transition
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < extendedChildren.length) {
      setCurrentIndex(newIndex);
    }
  }, [windowWidth, extendedChildren.length, currentIndex, rtl]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentTime = Date.now();
    const timeDelta = currentTime - lastDragTime.current;
    
    if (timeDelta > 0) {
      const distance = e.clientX - lastDragX.current;
      dragVelocity.current = distance / timeDelta; // pixels per millisecond
    }
    
    dragCurrentX.current = e.clientX;
    lastDragX.current = e.clientX;
    lastDragTime.current = currentTime;
    
    // Update index dynamically during drag
    const dragDistance = dragCurrentX.current - dragStartX.current;
    updateIndexFromDrag(dragDistance);
    
    // Force re-render for smooth dragging
    forceUpdate({});
    
    e.preventDefault();
  };

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (containerRef.current) {
      containerRef.current.style.userSelect = '';
    }
    
    // Calculate distance and apply inertia
    const distance = dragCurrentX.current - dragStartX.current;
    const absVelocity = Math.abs(dragVelocity.current);
    
    // Get slide dimensions
    const isMobile = windowWidth <= 768;
    const isSmallMobile = windowWidth <= 480;
    
    const currentDims = isSmallMobile 
      ? slideDimensions.smallMobile 
      : isMobile 
        ? slideDimensions.mobile 
        : slideDimensions.desktop;
        
    const slideWidth = currentDims.width;
    const spacing = currentDims.spacing;
    const slideSize = slideWidth + spacing;

    // Calculate base shift from dragging (positional)
    // distance > 0 (Right Drag): RTL -> Next(+), LTR -> Prev(-)
    const rawSlidesDragged = Math.round(distance / slideSize);
    const positionalShift = rtl ? rawSlidesDragged : -rawSlidesDragged;

    // Calculate extra momentum from velocity (Flick)
    let momentum = 0;
    if (absVelocity > 0.5) {
      momentum = Math.min(Math.ceil(absVelocity * 1.5), 3);
    } else if (absVelocity > 0.2) {
      momentum = 1;
    }

    // Apply direction to momentum
    // If distance > 0 (Right), momentum matches right direction
    const directionSign = distance > 0 ? (rtl ? 1 : -1) : (rtl ? -1 : 1);
    const momentumShift = momentum * directionSign;

    // Total shift relative to START of drag
    let totalShift = positionalShift;
    
    // Only add momentum if it pushes further in the same direction
    if (momentum > 0) {
       // If positional shift is 0 (didn't drag half way), but flicked hard, use momentum
       if (positionalShift === 0) {
         totalShift = momentumShift;
       } else {
         // If positional shift matches direction, ensure we go at least momentum distance
         if ((positionalShift > 0 && momentumShift > 0) || (positionalShift < 0 && momentumShift < 0)) {
            if (Math.abs(momentumShift) > Math.abs(positionalShift)) {
                totalShift = momentumShift;
            }
         }
       }
    }

    let finalIndex = dragStartIndex.current + totalShift;
      
    // تصحيح الحدود عند السحب
    if (finalIndex < 0) finalIndex = 0;
    if (finalIndex >= extendedChildren.length) finalIndex = extendedChildren.length - 1;
    
    // Apply single smooth transition
    setIsTransitioning(true);
    setCurrentIndex(finalIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
      // Handle loop transition smoothly
      if (finalIndex <= 1) {
        // وصلنا للبداية الوهمية أو قبلها -> ننتقل للنهاية الحقيقية
        setIsResetting(true);
        // المعادلة: الطول الكلي - 2 (للوهمي في النهاية) - (1 - finalIndex) للحفاظ على الإزاحة
        const realIndexEquivalent = (extendedChildren.length - 2) - (2 - finalIndex);
        setCurrentIndex(realIndexEquivalent);
        setTimeout(() => {
          setIsResetting(false);
        }, 50);
      } else if (finalIndex >= extendedChildren.length - 2) {
        // وصلنا للنهاية الوهمية أو بعدها -> ننتقل للبداية الحقيقية
        setIsResetting(true);
        // المعادلة: 2 + (finalIndex - (extendedChildren.length - 2))
        const realIndexEquivalent = 2 + (finalIndex - (extendedChildren.length - 2));
        setCurrentIndex(realIndexEquivalent);
        setTimeout(() => {
          setIsResetting(false);
        }, 50);
      }
    }, 500);
    
    // Reset values
    dragStartX.current = 0;
    dragCurrentX.current = 0;
    dragVelocity.current = 0;
    dragStartIndex.current = currentIndex;
  }, [isDragging, nextSlide, prevSlide, currentIndex, extendedChildren.length, windowWidth, rtl]);

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Touch event listeners with passive: false to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStartEvent = (e: TouchEvent) => {
      // Check if target is a button or inside a button
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        return;
      }

      // Enable audio/vibration on interaction
      userInteracted.current = true;

      if (e.touches.length === 0) return;
    touchStartX.current = e.touches[0].clientX;
      dragStartX.current = e.touches[0].clientX;
      dragCurrentX.current = e.touches[0].clientX;
      lastDragX.current = e.touches[0].clientX;
      lastDragTime.current = Date.now();
      dragVelocity.current = 0;
      dragStartIndex.current = currentIndex;
      setIsDragging(true);
      
      container.style.userSelect = 'none';
    };

    const handleTouchMoveEvent = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      
      const touchX = e.touches[0].clientX;
      touchEndX.current = touchX;
      
      const currentTime = Date.now();
      const timeDelta = currentTime - lastDragTime.current;
      
      if (timeDelta > 0) {
        const distance = touchX - lastDragX.current;
        dragVelocity.current = distance / timeDelta;
      }
      
      dragCurrentX.current = touchX;
      lastDragX.current = touchX;
      lastDragTime.current = currentTime;
      
      // Update index dynamically during drag
      const dragDistance = dragCurrentX.current - dragStartX.current;
      updateIndexFromDrag(dragDistance);
      
      // Force re-render for smooth dragging
      forceUpdate({});
      
      e.preventDefault();
    };

    const handleTouchEndEvent = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      if (container) {
        container.style.userSelect = '';
      }
      
      // Calculate distance and apply inertia
      const distance = dragCurrentX.current - dragStartX.current;
      const absVelocity = Math.abs(dragVelocity.current);
      
      // Determine how many slides to move based on velocity
      let slidesToMove = 0;
      
      if (absVelocity > 0.5) {
        slidesToMove = Math.min(Math.ceil(absVelocity * 1.5), 4);
      } else if (absVelocity > 0.2) {
        slidesToMove = 2;
      } else if (absVelocity > 0.05) {
        slidesToMove = 1;
      }
      
      // Apply movement based on direction with smooth single transition
      if (slidesToMove > 0) {
        const direction = distance > 0 ? 1 : -1;
        
        // Get current index from state (we need to access it from closure)
        const currentIdx = currentIndex;
        
        // Calculate final index for smooth single transition with endless loop
        let finalIndex = currentIdx + (direction * slidesToMove);
        
        // Handle endless loop boundaries
        if (finalIndex < 0) finalIndex = 0;
        if (finalIndex >= extendedChildren.length) finalIndex = extendedChildren.length - 1;
        
        // Apply single smooth transition instead of multiple jumps
        setIsTransitioning(true);
        setCurrentIndex(finalIndex);
        setTimeout(() => {
          setIsTransitioning(false);
          // Handle loop transition smoothly
          if (finalIndex <= 1) {
            // Jump to last real item
            setIsResetting(true);
            setCurrentIndex(extendedChildren.length - 3);
            setTimeout(() => {
              setIsResetting(false);
            }, 50);
          } else if (finalIndex >= extendedChildren.length - 2) {
            // Jump to first real item
            setIsResetting(true);
            setCurrentIndex(2);
            setTimeout(() => {
              setIsResetting(false);
            }, 50);
          }
        }, 500);
      } else {
        // If no movement needed, just ensure we're at the correct position
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 300);
      }
      
      // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
      dragStartX.current = 0;
      dragCurrentX.current = 0;
      dragVelocity.current = 0;
    };

    // Add touch event listeners with passive: false
    container.addEventListener('touchstart', handleTouchStartEvent, { passive: false });
    container.addEventListener('touchmove', handleTouchMoveEvent, { passive: false });
    container.addEventListener('touchend', handleTouchEndEvent, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStartEvent);
      container.removeEventListener('touchmove', handleTouchMoveEvent);
      container.removeEventListener('touchend', handleTouchEndEvent);
    };
  }, [isDragging, currentIndex, updateIndexFromDrag, nextSlide, prevSlide, extendedChildren.length]);

  // Global mouse event listeners for smooth dragging with requestAnimationFrame
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Cancel previous animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      // Use requestAnimationFrame for smooth performance
      animationFrameId.current = requestAnimationFrame(() => {
        const currentTime = Date.now();
        const timeDelta = currentTime - lastDragTime.current;
        
        if (timeDelta > 0) {
          const distance = e.clientX - lastDragX.current;
          dragVelocity.current = distance / timeDelta;
        }
        
        dragCurrentX.current = e.clientX;
        lastDragX.current = e.clientX;
        lastDragTime.current = currentTime;
        
        // Update index dynamically during drag
        const dragDistance = dragCurrentX.current - dragStartX.current;
        updateIndexFromDrag(dragDistance);
        
        // Force re-render for smooth dragging
        forceUpdate({});
      });
    };

    const handleGlobalMouseUp = () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      handleMouseUp();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isDragging, handleMouseUp, updateIndexFromDrag]);

  const getSlideStyle = (index: number) => {
    // If dragging, use dragStartIndex as reference to keep movement continuous relative to finger
    // If not dragging, use currentIndex
    const referenceIndex = isDragging ? dragStartIndex.current : currentIndex;
    const diff = index - referenceIndex;
    
    // تحديد أحجام responsive
    const isMobile = windowWidth <= 768;
    const isSmallMobile = windowWidth <= 480;
    
    const currentDims = isSmallMobile 
      ? slideDimensions.smallMobile 
      : isMobile 
        ? slideDimensions.mobile 
        : slideDimensions.desktop;
        
    const slideWidth = currentDims.width;
    const spacing = currentDims.spacing;
    
    // حساب الموضع الأفقي لكل شريحة
    let translateX = diff * (slideWidth + spacing);
    
    // إضافة إزاحة أثناء السحب بالماوس
    if (isDragging) {
      const dragOffset = dragCurrentX.current - dragStartX.current;
      // إضافة مقاومة للحركة (1 = حركة مطابقة للأصبع) لجميع الشاشات
      const resistanceFactor = 1;
      const adjustedOffset = dragOffset * resistanceFactor;
      // عكس الاتجاه: عندما نسحب لليمين، السلايدر يتحرك لليمين
      // في RTL، نعكس الاتجاه لأن translateX سيعكس لاحقاً
      translateX += rtl ? -adjustedOffset : adjustedOffset;
    }
    
    // إذا كان RTL، نعكس الاتجاه
    if (rtl) {
      translateX = -translateX;
    }
    
    let opacity = 1;
    let scale = 1;
    let rotateY = 0;
    let translateZ = 0;
    let zIndex = 10;
    
    if (diff === 0) {
      // الشريحة النشطة - في المقدمة
      opacity = 1;
      scale = 1.1;
      rotateY = 0;
      translateZ = 100;
      zIndex = 20;
    } else if (Math.abs(diff) === 1) {
      // الشريحة المجاورة
      opacity = 0.8;
      scale = 0.9;
      rotateY = diff > 0 ? (rtl ? 25 : -25) : (rtl ? -25 : 25);
      translateZ = -50;
      zIndex = 15;
    } else if (Math.abs(diff) === 2) {
      // الشرائح الثانوية
      opacity = 0.6;
      scale = 0.8;
      rotateY = diff > 0 ? (rtl ? 45 : -45) : (rtl ? -45 : 45);
      translateZ = -100;
      zIndex = 10;
    } else {
      // الشرائح البعيدة
      opacity = 0.3;
      scale = 0.7;
      rotateY = diff > 0 ? (rtl ? 60 : -60) : (rtl ? -60 : 60);
      translateZ = -150;
      zIndex = 5;
    }
    
    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex,
      transition: isDragging || isResetting
        ? 'none' 
        : isTransitioning 
          ? 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
          : 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      willChange: isDragging ? 'transform, opacity' : 'auto', // تحسين الأداء على الموبايل
    };
  };

  if (!children || children.length === 0) {
    return <div>لا توجد عناصر للعرض</div>;
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-64 sm:h-72 md:h-96 overflow-hidden pb-0" 
      style={{ 
        perspective: '1200px', 
        perspectiveOrigin: 'center center', 
        paddingBottom: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'pan-x', // السماح بالسحب الأفقي فقط
        WebkitOverflowScrolling: 'touch', // تحسين الأداء على iOS
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides Container */}
      <div 
        ref={containerRefForLoop}
        className="relative w-full h-full flex items-center justify-center" 
        style={{ transformStyle: 'preserve-3d' }}
      >
        {extendedChildren.map((child, index) => {
          const isMobile = windowWidth <= 768;
          const isSmallMobile = windowWidth <= 480;
          
          const slideWidth = isSmallMobile ? 140 : isMobile ? 220 : 280;
          const slideHeight = isSmallMobile ? 200 : isMobile ? 280 : 280;
          const isActive = index === currentIndex;
          
          return (
          <div
            key={index}
            className="absolute cursor-pointer"
            style={{
               ...getSlideStyle(index),
               width: `${slideWidth}px`,
               height: `${slideHeight}px`,
               left: '50%',
               top: '50%',
               marginLeft: `-${slideWidth / 2}px`,
               marginTop: `-${slideHeight / 2}px`,
               transformOrigin: 'center center',
             }}
            onClick={() => goToSlide(index - 2)}
          >
          <div 
            className="w-full h-full rounded-xl overflow-hidden shadow-lg transition-all duration-300" 
            style={{ 
              backfaceVisibility: 'hidden',
              background: isActive ? 'linear-gradient(135deg, #F9FAFB 0%, #EFF6FF 50%, #EEF2FF 100%)' : 'transparent',
              pointerEvents: 'auto'
            }}
          >
              {React.cloneElement(child as React.ReactElement, { isActive })}
            </div>
          </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && (
        <>
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              userInteracted.current = true;
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              userInteracted.current = true;
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              userInteracted.current = true;
              if (!isTransitioning && !isDragging) {
                nextSlide();
              }
            }}
            disabled={isTransitioning || isDragging}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-50 text-gray-800 p-2 md:p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation hover:text-blue-600"
            style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
            aria-label="التالي"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              userInteracted.current = true;
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              userInteracted.current = true;
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              userInteracted.current = true;
              if (!isTransitioning && !isDragging) {
                prevSlide();
              }
            }}
            disabled={isTransitioning || isDragging}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-50 text-gray-800 p-2 md:p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation hover:text-blue-600"
            style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
            aria-label="السابق"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showPagination && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {children.map((_, index) => {
            // Convert extendedChildren index to original children index (subtract 2)
            // We need to find if current displayed slide corresponds to this index
            // Since we have multiple copies, currentIndex could be anything
            
            // Map currentIndex to realIndex
            const totalReal = React.Children.count(children);
            let realCurrentIndex = currentIndex - 2;
            while(realCurrentIndex < 0) realCurrentIndex += totalReal;
            while(realCurrentIndex >= totalReal) realCurrentIndex -= totalReal;
            
            const isActive = index === realCurrentIndex;
            return (
            <button
              key={index}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  isActive
                  ? 'bg-blue-600 scale-125'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
            />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SimpleCarousel3D;