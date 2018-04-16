// TODO This needs to be rewritten as TypeScript with a module loader/bundler. Postponing for later
window.onload = () => {
    let params = new URL(window.location.href).searchParams;
    if(params.get('client') == 'chrome-ext') {
         $(document.body).addClass('chrome-ext');
    }

    let parentWindowOrigin = params.get('origin');
    if(parentWindowOrigin) {
        const message = {
            type: 'heightChanged',
            data: document.body.offsetHeight + 'px'
        };

        parent.postMessage(message, parentWindowOrigin);
    }
};