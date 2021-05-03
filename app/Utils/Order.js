const orderConfig = use("config/order");

class Order {

  /**
    * @description -This method generates a unique order reference
    * @param {object} req - The request payload sent from the router
    * @param {object} res - The response payload sent back from the controller
    * @returns {object} - unique order reference
    */
  async generateOrderReference() {    
    const orderId = require('order-id')(orderConfig.SECRET_KEY);
    return orderId.generate();
  }
}

module.exports = Order