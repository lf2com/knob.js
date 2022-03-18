(() => {
  /* eslint-disable no-console */
  /* eslint-disable no-alert */
  const { currentScript } = document;
  const { loadScript } = window;
  const rootPath = currentScript.getAttribute('src').replace(/\w+\.\w+$/, '');
  const modules = (currentScript.getAttribute('module') ?? '')
    .split(/[|;,\s]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  (async () => {
    if (!customElements.get('knob-base')) {
      console.log('Loading knob');

      try {
        // try to load development .js
        const knobJsPath = '/knob.dev.js';

        await loadScript(knobJsPath);
      } catch (error) {
        try {
          const knobJsPath = '../../dist/knob.min.js';

          console.log('Loading knob');
          await loadScript(knobJsPath);
        } catch (err) {
          const detail = `Failed to load knob: ${err.message}`;

          console.warn(detail);
          alert(detail);
        }
      }
    }

    console.info('`- Knob ready');
    await modules.reduce(async (prevPromise, module) => {
      await prevPromise;
      console.log(`Loading knob module: ${module}`);
      await loadScript(`${rootPath}/${module}.js`);
      console.log(`\`- Loaded: ${module}`);
    }, Promise.resolve());
  })();
})();
