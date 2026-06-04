import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51S0HXjGZwTv0wMspmbKha0IlXNfe4Vbcsc9L6ZjutbNmxNCv1ADy9eOk6AmOdBuIWnCWAKXHqajqgYw2fGIBtH5T008VuKEyIb');

const StripePaymentForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://student-portal-production-7307.up.railway.app/api/auth/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount })
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
        billing_details: {
          // You can collect additional billing details here if needed
        },
      }
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <div className="stripe-payment-modal">
      <div className="payment-content">
        <h3>Pay with Card</h3>
        <p>Total Amount: Rs. {amount.toLocaleString()}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="card-element-container">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          
          {error && <div className="payment-error">{error}</div>}
          
          <div className="payment-actions">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!stripe || processing}
            >
              {processing ? 'Processing...' : `Pay Rs. ${amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StripePayment = (props) => (
  <Elements stripe={stripePromise}>
    <StripePaymentForm {...props} />
  </Elements>
);

export default StripePayment;