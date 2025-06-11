import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.0.222:3333'
    //Verificar o ip da maquina que está rodando o backend
})

export default api;