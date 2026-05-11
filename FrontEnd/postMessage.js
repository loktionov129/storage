// window.opener
const helperWindow = window.open('https://alice.yandex.ru/');
helperWindow.onload = () => {
    helperWindow.postMessage('give me some info', '*');
};
window.addEventListener('message', ({data}) => {
    console.info(`message from helperWindow: ${data}`)
}, false);

//

// helperWindow
window.addEventListener('message', ({data}) => {
    console.info(`message from window.opener: ${data}`)
}, false);
window.opener.postMessage('Hello parent!', '*');
