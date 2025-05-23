export function initParallax() {
  const parallaxStrips = document.querySelectorAll(".parallax-strip");

  if (!parallaxStrips.length) {
    return;
  }

  const applyParallax = (stripElement) => {
    const image = stripElement.querySelector(".parallax-strip__image");
    const viewport = stripElement.querySelector(".parallax-strip__viewport");

    if (!image || !viewport) return;

    let animationFrameId = null;

    const updateParallax = () => {
      const rect = viewport.getBoundingClientRect();
      const viewportHeight = viewport.offsetHeight;
      const windowHeight = window.innerHeight;

      if (rect.bottom < 0 || rect.top > windowHeight) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        return;
      }

      const viewportCenterY = rect.top + viewportHeight / 2;
      const screenCenterY = windowHeight / 2;
      const difference = viewportCenterY - screenCenterY;
      // パララックス係数（0に近いほどゆっくり、1に近いほど前景と同じ）
      const parallaxFactor = 0.3;
      const translateY = -difference * parallaxFactor;
      image.style.transform = `translateY(${translateY}px)`;
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!animationFrameId) {
              animationFrameId = requestAnimationFrame(updateParallax);
            }
          } else {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        });
      },
      {
        rootMargin: "0px",
        threshold: 0,
      }
    );
    observer.observe(stripElement);
  };

  parallaxStrips.forEach(applyParallax);
}
