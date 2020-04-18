import axios from 'axios';

const instance = axios.create({
    baseURL : 'https://react-my-burger-8b2d1.firebaseio.com/'
});

export default instance;