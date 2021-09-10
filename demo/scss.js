/**
 * Loads SCSS files.
 */
(() => {
  const thisScript = document.head.lastChild;
  const styleLoading = document.createElement('style');

  styleLoading.innerHTML = `
    body::before {
      content: 'loading';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
    }

    body::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: #fff;
      z-index: 1;
    }
  `;
  document.head.appendChild(styleLoading);

  new Promise((resolve, reject) => {
    if (window.Sass) {
      resolve(window.Sass);
      return;
    }

    const sassJs = 'sass.js';
    const rootPath = thisScript.getAttribute('src').replace(/\/[^/]+?$/, '');
    const sassJsPath = `${rootPath}/${sassJs}`;
    const sassScript = document.createElement('script');
    sassScript.src = sassJsPath;
    document.head.appendChild(sassScript);
    sassScript.addEventListener('error', () => {
      reject(new Error('Loading sass JS failed'));
    });
    sassScript.addEventListener('load', () => {
      console.info('Loaded sass JS');
      resolve(window.Sass);
    });
    console.log(`Loading sass JS: ${sassJsPath}`);
  })
    .then(async (Sass) => {
      if (!Sass) {
        throw new ReferenceError(
          'Sass is not defined. Not going to load .scss files',
        );
      }

      const sass = new Sass();
      const selector = '[type="text/scss"]';
      const scssDoms = document.querySelectorAll(selector);

      /**
       * Returns scss text.
       */
      async function getScssText(domScss) {
        switch (domScss.nodeName.toLowerCase()) {
          default:
            throw new TypeError(`Invalid DOM: ${domScss.nodeName}`);

          case 'style':
            return domScss.innerHTML;

          case 'link': {
            const path = domScss.getAttribute('href');
            const response = await fetch(path, { method: 'GET' });
            const text = await response.text();

            return text;
          }
        }
      }

      /**
       * Loads scss file.
       */
      async function loadNextScss(index) {
        const domScss = scssDoms[index];

        if (!domScss) {
          return;
        }

        const path = domScss.getAttribute('href') ?? index;
        const text = await getScssText(domScss);

        await new Promise((resolve) => {
          console.log(`Compiling sass: ${path}`);
          sass.compile(text, (result) => {
            const { status } = result;

            if (status > 0) {
              const { column, line, message } = result;
              console.warn(` \`- Failed: ${message}`);
              console.warn(` \`- at line ${line}:${column}`);
              resolve();
            }

            const css = result.text;
            const domCss = document.createElement('style');

            domCss.innerHTML = css;
            domScss.replaceWith(domCss);
            console.log(' `- Succeeded');
            resolve();
          });
        });

        await loadNextScss(index + 1);
      }

      await loadNextScss(0);
    })
    .then(() => {
      console.log('All sass files done');
      styleLoading.parentNode.removeChild(styleLoading);
    })
    .catch((error) => {
      styleLoading.parentNode.removeChild(styleLoading);
      console.warn(error.message);
    });
})();
