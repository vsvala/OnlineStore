import axios from 'axios'
const baseUrl = 'http://localhost:3001/products'


const getAll = async () => {
    try {
      const response = await axios.get(baseUrl)
      console.log('service get products', response.data)
      //console.log('servic get all data', response.data)
      return response.data
    } catch (error) {
      return { error: 'Could not get products from db' }
    }
  }

  const exportedObject = {
    getAll
  
};
  export default exportedObject;

  