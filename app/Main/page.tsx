"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Aurora from "../components/Aurora";
import FileUploadDemo from "../components/fileupload";
import { motion } from "framer-motion";
import { FiUpload, FiServer, FiGlobe, FiLock, FiArrowRight } from "react-icons/fi";
import { FaAws, FaGoogle, FaMicrosoft } from "react-icons/fa";

// Enhanced Feature Card with smooth transitions
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
    viewport={{ once: true, margin: "-50px" }}
    className="flex flex-col items-center bg-gradient-to-b from-gray-900/50 to-gray-900/20 backdrop-blur-lg p-8 rounded-2xl border border-gray-700 hover:border-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-blue-500/10"
  >
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 shadow-inner">
      <Icon className="text-blue-300 text-2xl" />
    </div>
    <h3 className="text-xl font-semibold text-center bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">{title}</h3>
    <p className="text-gray-300/80 text-center mt-3 leading-relaxed">{description}</p>
  </motion.div>
);

// Cloud Provider Badge Component
const CloudBadge = ({ icon: Icon, name }: { icon: React.ElementType; name: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-md px-4 py-3 rounded-lg border border-gray-700 hover:border-blue-400/50 transition-all"
  >
    <Icon className="text-2xl" />
    <span className="font-medium">{name}</span>
  </motion.div>
);

export default function Home() {
  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      {/* Enhanced Aurora Background with subtle animation */}
      <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.2}
          speed={0.7}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/40 to-gray-900/90" />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center min-h-[90vh] px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex px-4 py-2 bg-gray-800/50 backdrop-blur-md rounded-full mb-6 border border-gray-700 shadow-sm"
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium text-sm tracking-wider">
                MULTI-CLOUD DEPLOYMENT PLATFORM
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Enterprise-Grade
              </span>{" "}
              Cloud Deployment
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Streamline your cloud operations with our unified platform that works seamlessly across AWS, Azure, and Google Cloud.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-600/90 hover:to-purple-600/90 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2">
                Get Started <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button  className="px-8 py-4 border-gray-700 hover:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                Schedule Demo
              </Button>
            </motion.div>

            {/* Cloud Providers Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-16 flex flex-wrap justify-center gap-4"
            >
              <CloudBadge icon={FaAws} name="AWS" />
              <CloudBadge icon={FaMicrosoft} name="Azure" />
              <CloudBadge icon={FaGoogle} name="Google Cloud" />
            </motion.div>
          </motion.div>
        </section>

                {/* File Upload Section */}
                <section className="min-h-[80vh] flex items-center justify-center px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            viewport={{ once: true, margin: "-100px" }}
            className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 shadow-2xl"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Start Deploying
                </span>{" "}
                in Minutes
              </h2>
              <p className="text-gray-300/80 max-w-xl mx-auto">
                Upload your project files or connect your repository to begin your cloud deployment journey.
              </p>
            </div>
            <FileUploadDemo />
          </motion.div>
        </section>


        {/* Feature Showcase */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Powerful Features
                </span>{" "}
                for Modern Teams
              </h2>
              <p className="text-gray-300/80 max-w-2xl mx-auto text-lg">
                Everything you need to deploy and manage applications at scale across multiple cloud providers.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={FiUpload}
                title="One-Click Deployments"
                description="Deploy your applications with a single click to any cloud provider."
              />
              <FeatureCard
                icon={FiServer}
                title="Unified Dashboard"
                description="Manage all your cloud resources from a single intuitive interface."
              />
              <FeatureCard
                icon={FiGlobe}
                title="Global Scaling"
                description="Automatically scale your applications across regions and providers."
              />
              <FeatureCard
                icon={FiLock}
                title="Enterprise Security"
                description="Built-in security controls and compliance certifications."
              />
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900/50 to-blue-900/20 backdrop-blur-lg rounded-2xl p-12 border border-gray-800 shadow-xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Cloud Operations?
              </h2>
              <p className="text-gray-300/80 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of companies who've simplified their multi-cloud strategy with our platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-600/90 hover:to-purple-600/90 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all">
                  Start Free Trial
                </Button>
                <Button variant="outline" className="px-8 py-4 border-gray-700 hover:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  Contact Sales
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}