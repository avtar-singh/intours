/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51MxkdeSHesHCrXaumYtjHwkGxqHoMKjjwTcSJmDn7KasotusJ0xcxcc4EOAWg6hMzdxvEuOwNPBhkRcQCCfb8LfU00BFm97Ir9'
);

const bookTour = async (tourId) => {
  try {
    // 1. Get session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // 2.  Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};

export { bookTour };
