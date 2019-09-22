import onWindowLoaded from './scene';

console.log(process.env.NODE_ENV)

if (process.env.NODE_ENV === 'development') {
    localStorage.debug = '*';
} else {
    localStorage.debug = '';
}


window.onload = onWindowLoaded;
