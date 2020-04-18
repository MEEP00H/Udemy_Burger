import React, { Component } from 'react';

import Aux from '../../hoc/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls'
import Modal from '../../components/UI/modal/Modal'
import OrderSummary from '../../components/Burger/OrderSummery/OrderSummery'
import Spinner from '../../components/UI/Spinner/Spinner'
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'
import axios from '../../axios-order';



const INGREDIENT_PRICE ={
    salad: 0.5,
    bacon: 0.4,
    cheese: 1.3,
    meat: 0.7
}

class BurgerBuilder extends Component {

    state = {
        ingredients: null,
        totalPrice : 4,
        purchasable:false,
        purchasing:false,
        loading: false,
        error: false
    }

    componentDidMount(){
        axios.get('https://react-my-burger-8b2d1.firebaseio.com/ingredients.json')
            .then(response =>{
                this.setState({ingredients: response.data})
            })
            .catch(error =>{
                this.setState({error:true})
            })
    }

    updatePurchaseState = (ingredients)=>{
        const sum = Object.keys(ingredients)
            .map(igKey =>{
                return ingredients[igKey];
            })
            .reduce((sum,el)=>{
                return sum + el 
            },0);
            this.setState({purchasable:sum > 0})
    }

    addIngredientHandler = (type) =>{
        const oldCount  =this.state.ingredients[type];
        const updateCount = oldCount+1;
        const updateIngredients ={
            ...this.state.ingredients
        }
        updateIngredients[type]  = updateCount;
        const priceAddition  =INGREDIENT_PRICE[type];
        const oldPrice  = this.state.totalPrice;
        const newPrice  = oldPrice+priceAddition;
        this.setState({totalPrice: newPrice,ingredients:updateIngredients})
        this.updatePurchaseState(updateIngredients)

    }

    removeIngredientHandler = (type) =>{
        const oldCount  =this.state.ingredients[type];
        if(oldCount <= 0){
            return;
        }
        const updateCount = oldCount-1;
        const updateIngredients ={
            ...this.state.ingredients
        }
        updateIngredients[type]  = updateCount;
        const priceDeduction  =INGREDIENT_PRICE[type];
        const oldPrice  = this.state.totalPrice;
        const newPrice  = oldPrice-priceDeduction;
        this.setState({totalPrice: newPrice,ingredients:updateIngredients})
        this.updatePurchaseState(updateIngredients)

    }
    purchaseHandler = () =>{
        this.setState({purchasing:true})
    }
    purchaseCancelHandler = () =>{
        this.setState({purchasing:false})
    }
    purchaseContinueHandler = () =>{
        this.setState({loading:true})
        const order ={
            ingredients : this.state.ingredients,
            price : this.state.totalPrice,
            customer : {
                name : 'Sophon Jampasornklin',
                address : {
                    street  : 'street01',
                    zipCode : '175120',
                    country :  'Thailand',
                },
                email : 'sophonjampasornklin@gmail.com'
            },
            deliveryMethod : 'Lineman'
        }
        axios.post('/order.json',order)
            .then(response => {
                this.setState({loading:false ,purchasing :false})
            })
            .catch(error => {
                this.setState({loading:false ,purchasing :false})
            })
    }

    render () {
        const disabledInfo ={
            ...this.state.ingredients
        };
        for(let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <= 0
        }
        let orderSummary = null ;
        let burger = this.state.error ? <p>can't be loaded</p> : <Spinner/>
        if(this.state.ingredients){
            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                        <BuildControls
                            ingredientAdded  = {this.addIngredientHandler}
                            ingredientRemoved = {this.removeIngredientHandler}
                            disabled = {disabledInfo}
                            purchasable ={this.state.purchasable}
                            ordered = {this.purchaseHandler}
                            price = {this.state.totalPrice}
                        />
                </Aux>
            );
            orderSummary =   <OrderSummary 
                ingredients = {this.state.ingredients}
                purchaseCancelled = {this.purchaseCancelHandler}
                purchaseContinued = {this.purchaseContinueHandler}
                price ={this.state.totalPrice}
            />
        }
        if(this.state.loading){
            orderSummary = <Spinner/>
        }

        return (
            <Aux>
                <Modal show ={this.state.purchasing} modalClosed ={this.purchaseCancelHandler}>
                  {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder,axios);