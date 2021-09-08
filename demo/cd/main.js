(() => {
  const CD_TITLE = 'Thief';
  const CD_LICENSE = 'A thief stole into a house being found';

  const domCd = document.getElementById('cd');
  const domInfo = domCd.querySelector('.info');
  const domTitle = domInfo.querySelector('.title');
  const domCdDuration = domInfo.querySelector('.duration');
  const domCdDurationCurrent = domCdDuration.querySelector('.current');
  const domCdDurationTotal = domCdDuration.querySelector('.total');
  const domLicense = domCd.querySelector('.license');

  const domControl = document.getElementById('control');
  const domPlay = domControl.querySelector('.play');
  const domPause = domControl.querySelector('.pause');
  const domStop = domControl.querySelector('.stop');
  const domTrack = domControl.querySelector('.track');
  const domDuration = domControl.querySelector('.duration');
  const domDurationCurrent = domDuration.querySelector('.current');
  const domDurationTotal = domDuration.querySelector('.total');
  const audio = document.getElementById('cd-audio');

  /**
   * Returns degree.
   */
  function sec2deg(sec) {
    return sec * 120; // (360 / 3)
  }

  /**
   * Returns time in hh:mm:ss format.
   */
  function sec2time(sec) {
    const strs = [
      Math.round(sec),
    ];

    while (strs[0] >= 60) {
      const n = strs[0];

      strs[0] = n % 60;

      strs.unshift(Math.floor(n / 60));
    }

    if (strs.length === 1) {
      strs.unshift(0);
    }

    return strs
      .map((n) => `0${n}`.substr(-2))
      .join(':');
  }

  /**
   * Sets current time.
   */
  function setCurrent(sec, ratio = sec2deg(sec) / domCd.max) {
    const time = sec2time(sec);

    domCdDurationCurrent.innerHTML = time;
    domDurationCurrent.innerHTML = time;
    domTrack.style.setProperty('--process', `${100 * ratio}%`);
  }

  /**
   * Sets total time.
   */
  function setTotal(sec) {
    const time = sec2time(sec);

    domCdDurationTotal.innerHTML = time;
    domDurationTotal.innerHTML = time;
  }

  /**
   * Listener for track.
   */
  function onTrack(event) {
    const { left, width } = domTrack.getBoundingClientRect();
    const { duration } = audio;
    const onMove = (evt) => {
      const {
        clientX: cx,
        touches: [
          {
            clientX: x = cx,
          } = {},
        ] = [],
      } = evt;
      const ratio = (x - left) / width;
      const time = duration * ratio;

      setCurrent(time, ratio);
      domCd.degree = sec2deg(time);
      audio.currentTime = time;
    };
    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    };

    event.preventDefault();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
    onMove(event);
  }

  // sets title
  domTitle.innerHTML = CD_TITLE;
  domLicense.innerHTML = CD_LICENSE;

  // init audio
  audio.addEventListener('loadedmetadata', () => {
    const { duration } = audio;

    domCd.min = 0;
    domCd.max = sec2deg(audio.duration);
    setCurrent(0);
    setTotal(duration);
  });

  // stop
  domStop.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
  });

  // pause
  domPause.addEventListener('click', () => {
    audio.pause();
  });

  // play
  domPlay.addEventListener('click', () => {
    audio.play();
  });

  // track
  domTrack.addEventListener('mousedown', onTrack);
  domTrack.addEventListener('touchstart', onTrack);

  // audio
  audio.addEventListener('playing', () => {
    let animationId = -1;

    const requestAnimationFrame = (
      window.requestAnimationFrame
      || window.webkitRequestAnimationFrame
    );
    const cancelAnimationFrame = (
      window.cancelAnimationFrame
      || window.webkitCancelAnimationFrame
    );
    const onPause = () => {
      cancelAnimationFrame(animationId);
      audio.removeEventListener('pause', onPause);
    };
    const onNextFrame = () => {
      const { currentTime } = audio;

      setCurrent(currentTime);
      domCd.degree = sec2deg(currentTime);
      animationId = requestAnimationFrame(onNextFrame);
    };

    audio.addEventListener('pause', onPause);
    onNextFrame();
  });

  // knob
  domCd.addEventListener('spining', () => {
    const { degree, max } = domCd;
    const { duration } = audio;
    const ratio = degree / max;
    const time = duration * ratio;

    setCurrent(time, ratio);
    audio.currentTime = time;
  });
})();