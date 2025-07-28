// src/components/SubscriptionModal/SubscriptionModal.tsx

"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from "@nextui-org/react";
import { CheckCircle, Star, Zap, Shield } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SubscriptionModal = ({ isOpen, onClose }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe", {
        method: "POST",
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("Could not create Stripe Checkout session.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <Zap className="text-primary w-5 h-5" />, text: "All AI tools unlocked" },
    { icon: <Star className="text-yellow-500 w-5 h-5" />, text: "Priority support & early access" },
    { icon: <CheckCircle className="text-green-500 w-5 h-5" />, text: "Unlimited usage & chat history" },
    { icon: <Shield className="text-blue-500 w-5 h-5" />, text: "Enhanced security & backups" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" className="rounded-xl shadow-xl">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center text-center">
              <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
              <span className="text-sm text-gray-500">Only $10/month</span>
            </ModalHeader>

            <Divider />

            <ModalBody className="pb-2">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800 mb-4">
                  Get more with the <span className="text-primary font-bold">Pro Plan</span>
                </p>
              </div>

              <ul className="space-y-3">
                {features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {f.icon}
                    <span className="text-gray-700">{f.text}</span>
                  </li>
                ))}
              </ul>
            </ModalBody>

            <ModalFooter className="flex justify-between">
              <Button color="danger" variant="light" onPress={close}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubscribe}
                isLoading={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
              >
                {isLoading ? "Redirecting..." : "Subscribe Now"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SubscriptionModal;
