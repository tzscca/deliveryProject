import React from "react";
import '../css/Order.css';
import { Steps, Form, Input, Row, message } from 'antd';
import FromTo from './Forms/FromTo';
import PaymentInfo from './Forms/PaymentInfo'
import Confirmation from './Forms/Confirmation'
import OrderComplete from "./Forms/OrderComplete";
import { order } from "./Utils"
const { Step } = Steps;

export default class Order extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      current: 0,
      forms: [
        <FromTo incrementPage={this.incrementPage} setState={this.updateState} />,
        <PaymentInfo incrementPage={this.incrementPage} setState={this.updateState} />,
        <Confirmation setState={this.updateState} completeForm={this.completeForm}
          order={this.state.Order} droneOrRobot={this.state.droneOrRobot} />
      ],
      formComplete: false,
      testing: false
    }
  }

  //current will be 0,1,2. Because antd steps component assigns each step to incrementing current's.
  state = {
    current: 0,
  }

  // @Id
  // private long cardNumber;
  // private int userID;
  // private String firstName;
  // private String expirationDate;
  // private int cvv;
  // private String lastName;
  // private String zipCode;
  // private String address;
  completeForm = () => {
    console.log('Order Here:', this.state.Order)
    const { date, fromAddress, orderStatus, size, toAddress, totalCost, packageWeight,
      sendingName, sendingPhone, receivingPhone, recipientName } = this.state.Order;

    this.state.CreditCard.cvv = parseInt(this.state.CreditCard.cvv)
    const newOrder = {
      actualPickUpTime: date,
      fromAddress: fromAddress,
      orderStatus: 'Ordered',
      size: this.state.testing ? size : size[0],
      toAddress: toAddress,
      totalCost: totalCost,
      weight: this.state.testing ? this.state.Order.weight : packageWeight[0],
      senderName: sendingName,
      senderPhoneNumber: sendingPhone,
      recipientName: recipientName,
      recipientPhoneNumber: receivingPhone,
      deliveryMethod: this.state.droneOrRobot,
      estimatedDeliveryTime: this.state.estimatedDeliveryTime,
      totalCost: this.state.totalCost
    };
    console.log('order to backend', {
      order: newOrder,
      credit_card: this.state.CreditCard
    })
    order({
      order: newOrder,
      credit_card: this.state.CreditCard
    }).then(
      (data) => {
        this.setState({
          formComplete: true
        });
        message.success('Order complete!');
        this.setState({
          orderId: data
        });
      }
    ).catch(
      (err) => {
        message.error(err.message)
      }
    )
  }

  updateState = (newState) => {
    //console.log('updatestate', newState);
    //console.log('old state', this.state);
    this.setState(newState);
    //console.log('after set state', this.state)
  }

  fromToForm2 =
    (<Form>
      <Form.Item>
        <h2>
          From
        </h2>
      </Form.Item>
      <Form.Item
        rules={[{ required: true, message: 'Please enter the sending address.' }]}
      >
        <Input placeholder="Address" />
      </Form.Item>
    </Form>)

  onChange = (newCurrent) => {
    this.setState({
      current: newCurrent,
    });
    if (newCurrent >= 2) {
      this.setState({
        forms: [
          <FromTo incrementPage={this.incrementPage} setState={this.updateState} />,
          <PaymentInfo incrementPage={this.incrementPage} setState={this.updateState} />,
          <Confirmation setState={this.updateState} completeForm={this.completeForm} order={this.state.Order} orderId={this.state.orderId} />
        ]
      });
      console.log('>=2')
    }
  }

  incrementPage = (increment) => {
    this.setState({
      current: this.state.current + increment,
    });
    this.setState({
      forms: [
        <FromTo incrementPage={this.incrementPage} setState={this.updateState} />,
        <PaymentInfo incrementPage={this.incrementPage} setState={this.updateState} />,
        <Confirmation setState={this.updateState} completeForm={this.completeForm} order={this.state.Order} orderId={this.state.orderId} />
      ]
    });
  }

  render() {

    const { forms, current, formComplete } = this.state;
    return (
      !formComplete ?
        <div className="order-background" >
          <Steps current={current} onChange={this.onChange} direction="vertical" className="steps">
            <Step title="Step 1" description="Address + Package + Pickup time" />
            <Step title="Step 2" description="Payment Information" />
            <Step title="Step 3" description="Order Confirmation" />
          </Steps>
          <div className="form">
            {
              forms[current]
            }
          </div>
        </div> : <OrderComplete setState={this.updateState} orderId={this.state.orderId} />
    )
  }
}