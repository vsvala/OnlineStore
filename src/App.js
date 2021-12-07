import './App.css';
import React, {Component} from "react";
import axios from 'axios'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
// import AddProduct from './components/AddProducts';
import Cart from './components/Cart';
import ProductList from './components/ProductList';
import Context from "./Context";


export default class APP extends Component{
  constructor(props){
    super(props);
    this.state={
      cart:{},
      products:[]
    };
    // this.routerRef=React.createRef();
    
  }

  async componentDidMount(){
    console.log("didmount")
  
  let cart = localStorage.getItem("cart");
  

  // const res = await axios.get('/api/products')
  // console.log(res)
  // console.log(res.data)

  await axios.get('/api/products').then(response => {
  const products= response.data 
  console.log("products",products)
  console.log("this",this.state)

  cart = cart? JSON.parse(cart) : {};
  console.log("after")
  this.setState({ products:products, cart });
  console.log("set this state to products and casrds",this.state)
})

  
  }

  addToCart = cartItem => {
    console.log("addToChart funktio")
    let cart = this.state.cart;
    if (cart[cartItem.id]) { //product name
      cart[cartItem.id].amount += cartItem.amount;//lisää amount jos on jo
    } else {
      cart[cartItem.id] = cartItem; //lisää tuotteen jos on jo
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log(cart, "add to cart() funktio asetetaan cart localstoreeen")
    //this.set.set(cart)
    this.setState({ cart });
    console.log(this.state.cart, "asetetaan cart state")
    
  };
  removeFromCart = cartItemId => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };
  
  clearCart = () => {
    console.log("clearCart localstore ja state.cart tyhjäys")
    let cart = {};
    localStorage.removeItem("cart");
    this.setState({ cart });
  };


checkout = async () => {
  const cart = this.state.cart;
  const orderList =[]
 
    console.log("cart from checkout",this.state.cart)
    for (const [key, value] of Object.entries(cart)) {
      console.log(key, value);
      console.log(value.product.id, value.amount);
      const productId = value.product.id
      const productName = value.product.name
      const producPrice = value.product.price
      const productAmount = value.amount  

      orderList.push({id:productId, amount:productAmount, name:productName, price:producPrice})
  }
  console.log(orderList, "orderlist");

  const order= { 
    products:orderList
  }
  console.log("Order to sent to service:", order)
  
 try {
 const response= await axios.post( '/api/orders', order)
    console.log('response data from post', response.data)
   
    //TODO //if (response. === OK) {

/*     const products = this.state.products.map(p => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount; //vähentää product stock nimen mukaan tuotteen  
      } return p;
    }) */

    if (response.data.status === "OK") {
      console.log("status OK")
  /*      const products = this.state.products.map(p => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount; //vähentää product stock nimen mukaan tuotteen  
      } return p;}) */
     // this.setState({ products })
    await axios.get('/api/products').then(response => {
      console.log("resp data/orders from invenrory",response.data)
      //const products= response.data
      this.setState({ products:response.data });
      console.log( "state after",  this.state.products);
      this.clearCart();
    })
    }
   if (response.data.status === "NOT_OK"){
      console.log("Tilaus ei onnistunut joitain tuotteita ei satavilla")
      const notAvailable = response.data.products.filter(item=> item.status==="NOT_OK") 
      notAvailable.forEach(element => console.log(element.name));
      //TODO notification for not available produts käyttäjälle
      await axios.get('/api/products').then(response => {
        console.log("resp data/orders from invenrory",response.data)
        //const products= response.data
        this.setState({ products:response.data });
        console.log( "state after",  this.state.products);
        //poista listassa olevat chatissa
        this.clearCart();// koko vai ainakin ne joita ei enää oo
        //TO DO history push
        //CASHE
      })
 }
 else{
  console.log("Tilaus ei onnistunu something went wrong")


 }

  return response.data;


  } catch (error) {
 return { error: 'Could not sent order' }
 }
  
  };


render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          //login: this.login,
          // addProduct: this.addProduct,
          clearCart: this.clearCart,
          checkout: this.checkout
        }}
      >
        <Router >
          {/* ref={this.routerRef} */}
        <div className="App">
          <nav
            className="navbar container"
            role="navigation"
            aria-label="main navigation"
          >
            <div className="navbar-brand">
              <b className="navbar-item is-size-4">Online store</b>
            <label
                role="button"
                className="navbar-burger burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarBasicExample"
                onClick={e => {
                  e.preventDefault();
                  this.setState({ showMenu: !this.state.showMenu });
                }}
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </label> 
            </div>

              <div className={`navbar-menu`}>
                <Link to="/products" className="navbar-item">
                  Products
                </Link>
                <Link to="/cart" className="navbar-item">
                  Cart
                  <span
                    className="tag is-primary"
                    style={{ marginLeft: "5px" }}
                  >
                    { Object.keys(this.state.cart).length }
                  </span>
                </Link>
              </div>
            </nav>
            <Routes>
              <Route exact path="/" element={<ProductList/>} />
              <Route exact path="/cart" element={<Cart/>} />
              <Route exact path="/products" element ={<ProductList/>} />
            </Routes>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}



// const productList= [
//     {
//       "id": "hdmdu0t80yjkfqselfc",
//       "name": "Jeans",
//       "stock": 10,
//       "price": 399.99,
//       "shortDesc": "Nulla facilisi. Curabitur at lacus ac velit ornare lobortis.",
//       "description": "Cras sagittis. Praesent nec nisl a purus blandit viverra. Ut leo. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Fusce a quam."
//     },
//     {
//       "id": "3dc7fiyzlfmkfqseqam",
//       "name": "socs",
//       "stock": 20,
//       "price": 299.99,
//       "shortDesc": "Nulla facilisi. Curabitur at lacus ac velit ornare lobortis.",
//       "description": "Cras sagittis. Praesent nec nisl a purus blandit viverra. Ut leo. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Fusce a quam."
//     },
//     {
//       "id": "aoe8wvdxvrkfqsew67",
//       "name": "T-shirts",
//       "stock": 15,
//       "price": 149.99,
//       "shortDesc": "Nulla facilisi. Curabitur at lacus ac velit ornare lobortis.",
//       "description": "Cras sagittis. Praesent nec nisl a purus blandit viverra. Ut leo. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Fusce a quam."
//     },
//     {
//       "id": "bmfrurdkswtkfqsf15j",
//       "name": "dresses",
//       "stock": 5,
//       "price": 109.99,
//       "shortDesc": "Nulla facilisi. Curabitur at lacus ac velit ornare lobortis.",
//       "description": "Cras sagittis. Praesent nec nisl a purus blandit viverra. Ut leo. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Fusce a quam."
//     }
//   ] 
