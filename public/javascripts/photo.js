(function () {
  // code from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      const input = document.querySelector('#input-photos');
      const dataTransfer = new DataTransfer();

      if (input != null) input.addEventListener('change', updateImageDisplay);

      function updateImageDisplay() {
        const preview = document.querySelector('#preview');
        while (preview.firstChild) {
          preview.removeChild(preview.firstChild);
        }

        const curFiles = input ? input.files : dataTransfer.files;
        if (curFiles.length === 0) {
          const para = document.createElement('p');
          para.textContent = 'Aucune photo';
          preview.appendChild(para);
        } else {
          const list = document.createElement('ol');
          preview.appendChild(list);

          for (const file of curFiles) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            const image = document.createElement('img');
            image.src = URL.createObjectURL(file);
            link.classList.add('photo-link');
            link.href = image.src;
            link.target = '_blank';
            link.rel = 'noopener';

            link.appendChild(image);
            listItem.appendChild(link);
            list.appendChild(listItem);
          }
        }
      }

      // Add previous files to input
      (async () => {
        const preview = document.querySelector('#preview');
        const annonceId = preview.dataset.id;
        const photoCount = preview.dataset.count;
        const promises = [];
        for (let i = 1; i <= photoCount; i++) {
          const promise = fetch(`/annonces/${annonceId}/images/${i}`, {})
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              dataTransfer.items.add(new File([blob], i, { type: blob.type }));
            });
          promises.push(promise);
        }
        await Promise.all(promises);
        if (input != null) input.files = dataTransfer.files;
        updateImageDisplay();

        const inputPreview = document.querySelector('#input-preview');
        if (inputPreview != null) {
          preview.id = 'ad-preview';
          const clone = preview.cloneNode(true);
          clone.id = 'preview';
          inputPreview.replaceWith(clone);
        }
      })();
    }
  };
})();
