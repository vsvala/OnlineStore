import './App.css';
import React, {Component} from "react";
import axios from 'axios'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Cart from './components/Cart';
import ProductList from './components/ProductList';
import Context from "./Context";




export default class APP extends Component{
  constructor(props){
    super(props);
    this.state={
      cart:{},
      products:[],
      notification:""
    };   
  }

  async componentDidMount(){
  console.log("didmount")
  
  let cart = localStorage.getItem("cart");
  
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
      cart[cartItem.id].amount += cartItem.amount;//add just amount if allready in cart
    } else {
      cart[cartItem.id] = cartItem; 
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }   
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log(cart, "add to cart() funktio asetetaan cart localstoreeen")
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


// place order or if product out of stock clear cart, update products and notify user
checkout = async () => {
  const cart = this.state.cart;
  const orderList =[]

    for (const [key, value] of Object.entries(cart)) {
      console.log(key, value);
      console.log(value.product.id, value.amount);
      const productId = value.product.id
      const productName = value.product.name
      const producPrice = value.product.price
      const productAmount = value.amount

      orderList.push({  id:productId, name:productName, amount:productAmount,  price:producPrice})
  }
  const order= { 
    products:orderList
  }
  console.log("Order to sent to service:", order)
  
 try {
 const response= await axios.post( '/api/orders', order)
    console.log('post response data from or orderservisefront', response.data)
  
    if (response.data.status === "OK") {
      console.log("POST status OK")
      await axios.get('/api/products').then(response => {
      console.log("resp data/orders from invenrory",response.data)
      this.setState({ products:response.data });
      console.log( "state after",  this.state.products);
      this.clearCart();
      this.setState({ notification:"Thank you for your order,  Order sent succefully" });
      setTimeout(() => {
        this.setState({ notification:null });    
      }, 5000)
    })
    }
   //If some products are not available, update product state, clear shopping cart and notify user to replace the order 
   if (response.data.status === "NOT_OK"){
      console.log("POST NOT OK, Tilaus ei onnistunut joitain tuotteita ei satavilla")
      const notAvailable = response.data.products.filter(item=> item.status==="NOT_OK") 
      notAvailable.forEach(element => console.log(element.name));
      const noproducts=notAvailable.map(s=>s.name)
      this.setState({ notification: `OUT OF STOCK:  ${noproducts}   Please replace the order!!!!`});
      //notAvailable.forEach(element =>  this.setState({ notification: `OUT OF STOCK: ${element.name}   Please replace the order!!!!`}));
      setTimeout(() => {
        this.setState({ notification:null });    
      }, 15000)
    


      await axios.get('/api/products').then(response => {
        console.log("resp data/orders from invenrory",response.data)
        this.setState({ products:response.data });
        console.log( "state after",  this.state.products);
        this.clearCart();
      })
    
  }
  else{
  console.log("Tilaus ei onnistunu something went wrong")
 }
  return response.data;

} catch (error) {
    this.setState({ notification: 'Something went wrong. Please replace the order!.' });
    setTimeout(() => {
      this.setState({ notification:null });    
    }, 5000)
 } 
  }


render() {
    return (
      
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          clearCart: this.clearCart,
          checkout: this.checkout,
          notifify:this.state.notification
        }}
      >
        <Router >
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
                <Link to="/" className="navbar-item">
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
              {/* <Route exact path="/products" element ={<ProductList/>} /> */}
            </Routes>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}



  /*      const products = this.state.products.map(p => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount; //vähentää product stock nimen mukaan tuotteen  
      } return p;}) */
     // this.setState({ products })