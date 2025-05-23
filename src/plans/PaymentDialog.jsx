import React, { useState } from 'react';
import {
    X,
    CreditCard,
    DollarSign
} from 'lucide-react';
import clsx from 'clsx';
import { FaMoneyBillAlt } from 'react-icons/fa';
import { FaStripeS } from 'react-icons/fa6';
import { FaPaypal } from 'react-icons/fa';
import { SiRazorpay } from 'react-icons/si';
import axios from 'axios';
import { toast } from 'sonner';

const PaymentDialog = ({ plan, onClose }) => {
    const [activePaymentMethod, setActivePaymentMethod] = useState('stripe');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        if (activePaymentMethod === 'offline') {
            toast.info('Please contact our support team for offline payment instructions.');
            return;
        }

        setIsProcessing(true);
        try {
            let apiEndpoint;
            let planId;

            switch (activePaymentMethod) {
                case 'stripe':
                    apiEndpoint = 'buy_plan_stripe';
                    planId = plan.stripePlanId;
                    break;
                case 'paypal':
                    apiEndpoint = 'buy_plan_paypal';
                    planId = plan.paypalPlanId;
                    break;
                case 'razorpay':
                    apiEndpoint = 'buy_plan_razorpay';
                    planId = plan.razorpayPlanId;
                    break;
                default:
                    throw new Error('Invalid payment method');
            }

            const token = localStorage.getItem('authToken');

            const response = await axios.post(
                `https://vokal-api.oyelabs.com/user/${apiEndpoint}/${planId}`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'access-token': token
                    }
                }
            );

            if (response.data && response.data.success) {
                let redirectUrl;

                if (activePaymentMethod === 'stripe' && response.data.data.checkoutUrl) {
                    redirectUrl = response.data.data.checkoutUrl;
                } else if ((activePaymentMethod === 'paypal' || activePaymentMethod === 'razorpay') && response.data.data.approvalUrl) {
                    redirectUrl = response.data.data.approvalUrl;
                } else {
                    throw new Error('Missing redirect URL in response');
                }

                // Open the URL in a new tab
                window.open(redirectUrl, '_blank', 'noopener,noreferrer');
                onClose();
            } else {
                console.error('Invalid response format');
                toast.error(response.data?.message || 'Payment processing failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || error.message || 'Payment processing failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const PaymentMethodTab = ({ id, title, active, onClick }) => (
        <button
            className={clsx(
                'px-4 py-3 w-full flex justify-start items-center text-md font-medium transition-colors duration-200',
                active ? 'bg-primary-500 text-background' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            )}
            onClick={() => onClick(id)}
        >
            {title}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[6500]">
            <div className="bg-background rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto hide-scrollbar m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Complete Your Subscription</h2>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">Selected Plan</p>
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <div className="bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <DollarSign className="text-background h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium">{plan.title}</h3>
                            <p className="text-sm text-gray-500">${plan.price} / {plan.trail_days} days</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6 w-full">
                    <div className="flex flex-col mb-4 border-b gap-4 justify-between items-center w-full">
                        <PaymentMethodTab
                            id="offline"
                            title={<><FaMoneyBillAlt className="inline mr-3" />Offline</>}
                            active={activePaymentMethod === 'offline'}
                            onClick={setActivePaymentMethod}
                        />
                        <PaymentMethodTab
                            id="stripe"
                            title={<><FaStripeS className="inline mr-3" />Stripe</>}
                            active={activePaymentMethod === 'stripe'}
                            onClick={setActivePaymentMethod}
                        />
                        <PaymentMethodTab
                            id="paypal"
                            title={<><FaPaypal className="inline mr-3" />PayPal</>}
                            active={activePaymentMethod === 'paypal'}
                            onClick={setActivePaymentMethod}
                        />
                        <PaymentMethodTab
                            id="razorpay"
                            title={<><SiRazorpay className="inline mr-3" />Razorpay</>}
                            active={activePaymentMethod === 'razorpay'}
                            onClick={setActivePaymentMethod}
                        />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 text-center">
                            {activePaymentMethod === 'offline' &&
                                "Please contact our support team for offline payment instructions."}
                            {activePaymentMethod === 'stripe' &&
                                "You'll be redirected to Stripe to complete your payment securely."}
                            {activePaymentMethod === 'paypal' &&
                                "You'll be redirected to PayPal to complete your payment."}
                            {activePaymentMethod === 'razorpay' &&
                                "You'll be redirected to Razorpay to complete your payment."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        className="flex-1 py-3 px-4 bg-primary-500 text-yellow-500 font-medium rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            'Processing...'
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Pay ${plan.price}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentDialog;