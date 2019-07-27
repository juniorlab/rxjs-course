window.onload = () => {
    // const bc = new BroadcastChannel('test_channel');
    const el = document.getElementById('output');
    const button = document.getElementsByTagName('button')[0];
    button.addEventListener('click', () => {
        // bc.postMessage({'her': 'hui'});
        el.firstChild.replaceData(0, 1, 'p')
    });

    // bc.onmessage = (ev) => console.log(ev);
}
