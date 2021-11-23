import axios from 'axios'
const baseUrl = '/api/products'


const postOrder = async (order) => {
    console.log('servise postOrder', order)
    try {
      const response = await axios.post(baseUrl, order)
      return response.data
    } catch (error) {
      const status = error.response.status
      if (status === 500) {
        return { error: 'Unable to connect to server.' }
      } else if (status === 400) {
        return { error:'Username must be unique!' }
      } else if (status === 401) {
        return { error: 'Username or password is incorrect.' }
      } else {
        return { error: 'Unable to connect to server.' }
      }
    }
  }

  export default postOrder
  