export const generateOrderConfirmationHTML = (order) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E5E5; border-radius: 8px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #E5E5E5; }
    .logo { color: #F5C400; font-size: 24px; font-weight: bold; }
    .order-info { margin-top: 20px; background: #F8F8F8; padding: 15px; border-radius: 8px; }
    .items { margin-top: 20px; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E5E5; }
    .totals { margin-top: 20px; border-top: 2px solid #E5E5E5; padding-top: 20px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .total-final { font-weight: bold; font-size: 18px; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6B7280; }
    .button { display: inline-block; padding: 10px 20px; background-color: #F5C400; color: #1A1A1A; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">RoadsRide</div>
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase, ${order.customerName}!</p>
    </div>
    
    <div class="order-info">
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
      <p><strong>Shipping Address:</strong><br/>
      ${order.address}<br/>
      ${order.city}, ${order.state} ${order.pincode}</p>
    </div>

    <div class="items">
      <h3>Items Ordered</h3>
      ${order.items.map(item => `
        <div class="item">
          <div>${item.quantity}x ${item.productName}</div>
          <div>₹${item.price * item.quantity}</div>
        </div>
      `).join('')}
    </div>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>₹${order.subtotal}</span>
      </div>
      ${order.discount > 0 ? `
      <div class="total-row" style="color: #22C55E">
        <span>Discount</span>
        <span>-₹${order.discount}</span>
      </div>
      ` : ''}
      <div class="total-row total-final">
        <span>Total</span>
        <span>₹${order.total}</span>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/track-order" class="button">Track Your Order</a>
    </div>

    <div class="footer">
      <p>If you have any questions, reply to this email or contact us at info.roadsride@gmail.com</p>
      <p>RoadsRide © 2026. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const generateAdminOrderNotificationHTML = (order) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E5E5; border-radius: 8px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #E5E5E5; }
    .logo { color: #F5C400; font-size: 24px; font-weight: bold; }
    .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .details-table th, .details-table td { padding: 10px; border: 1px solid #E5E5E5; text-align: left; }
    .details-table th { background-color: #F8F8F8; width: 35%; font-weight: bold; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">RoadsRide</div>
      <h2>New Order Received!</h2>
      <p>Order #${order.orderNumber}</p>
    </div>
    
    <table class="details-table">
      <tr><th>Customer Name</th><td>${order.customerName}</td></tr>
      <tr><th>Email</th><td>${order.email}</td></tr>
      <tr><th>Phone</th><td>${order.phone}</td></tr>
      <tr><th>Address</th><td>${order.address}<br/>${order.city}, ${order.state} ${order.pincode}</td></tr>
      <tr><th>Payment Method</th><td>${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</td></tr>
      <tr><th>Subtotal</th><td>₹${order.subtotal}</td></tr>
      ${order.discount > 0 ? `<tr><th>Discount</th><td style="color: #22C55E">-₹${order.discount}</td></tr>` : ''}
      <tr><th>Total Amount</th><td style="font-weight:bold;font-size:18px;">₹${order.total}</td></tr>
    </table>

    <h3>Items Ordered</h3>
    <table class="details-table">
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th>Price</th>
      </tr>
      ${order.items.map(item => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price * item.quantity}</td>
        </tr>
      `).join('')}
    </table>

    <div class="footer">
      <p>RoadsRide Automated Order Notification</p>
    </div>
  </div>
</body>
</body>
</html>
`;

export const generateSubscriberThankYouHTML = (email) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E5E5; border-radius: 8px; text-align: center; }
    .header { padding-bottom: 20px; border-bottom: 1px solid #E5E5E5; }
    .logo { color: #F5C400; font-size: 24px; font-weight: bold; }
    .content { padding: 30px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">RoadsRide</div>
    </div>
    <div class="content">
      <h2>Thank You for Subscribing!</h2>
      <p>Hello,</p>
      <p>Thank you for subscribing to our newsletter with <strong>${email}</strong>.</p>
      <p>We'll keep you updated with the latest recommendations, tips, and new arrivals for premium car and bike accessories.</p>
      <p>Stay tuned!</p>
    </div>
    <div class="footer">
      <p>If you did not request this subscription, please ignore this email.</p>
      <p>RoadsRide © 2026. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const generateAdminSubscriberNotificationHTML = (email) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E5E5; border-radius: 8px; }
    .header { padding-bottom: 20px; border-bottom: 1px solid #E5E5E5; }
    .logo { color: #F5C400; font-size: 24px; font-weight: bold; }
    .content { padding: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">RoadsRide Admin</div>
      <h2>New Newsletter Subscriber!</h2>
    </div>
    <div class="content">
      <p>A new user has just subscribed to the newsletter.</p>
      <p><strong>Email:</strong> ${email}</p>
    </div>
  </div>
</body>
</html>
`;
