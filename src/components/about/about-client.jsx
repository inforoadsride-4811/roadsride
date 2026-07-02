'use client';

import { motion } from 'framer-motion';
import { Shield, Car, CheckCircle, Star, Sparkles, Lock, Network, CreditCard, CircleDollarSign } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const iconMap = {
  Shield: Shield,
  Car: Car,
  CheckCircle: CheckCircle,
  Star: Star,
  Sparkles: Sparkles,
};

export default function AboutClient({ data }) {
  const { title, introText, heroImage, secondaryImage, features, teamMembers } = data;

  // Split introText if it has paragraphs
  const paragraphs = introText.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="space-y-20 md:space-y-32">
      {/* Hero Section (2-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <h4 className="text-brand-yellow font-bold uppercase tracking-wider text-sm mb-3">
              About Us
            </h4>
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black leading-tight">
              {title}
            </h2>
          </div>

          <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
            {paragraphs.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Features Vertical List */}
          <div className="space-y-8 pt-6 border-l-2 border-brand-yellow/30 ml-3 pl-8 relative">
            {features?.map((feature, idx) => {
              const Icon = iconMap[feature.icon] || CheckCircle;
              return (
                <div key={idx} className="relative">
                  <div className="absolute -left-[49px] top-0 w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center shadow-[0_0_0_4px_white]">
                    <Icon size={16} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-black mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Content - Main Hero Image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative lg:sticky lg:top-32"
        >
          <div className="aspect-[3/4] md:aspect-auto md:h-[800px] w-full rounded-[2rem] overflow-hidden bg-gray-100 shadow-2xl relative">
            {heroImage ? (
              <img src={heroImage} alt="RoadsRide Hero" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-2 border-dashed rounded-[2rem]">
                <Image src="/rr.webp" alt="RoadsRide" width={200} height={60} className="opacity-50 grayscale mb-4" />
                <p>Upload Hero Image in Admin Panel</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Extended Intro & Team Section */}
      <div className="space-y-16 pt-10 border-t border-gray-100">

        {/* Extended Text (if any more paragraphs exist) */}
        {paragraphs.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center space-y-6 text-gray-600 text-lg leading-relaxed"
          >
            {paragraphs.slice(2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>
        )}

        {/* Team Grid */}
        {teamMembers && teamMembers.length > 0 && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-brand-black">Meet Our Team</h2>
              <div className="w-20 h-1 bg-brand-yellow mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden relative">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        No Photo
                      </div>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-brand-black">{member.name}</h3>
                    <p className="text-brand-yellow font-medium mt-1">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid Features Section with Flip Effect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-16 pb-10 border-t border-gray-100">

        {/* Left Content - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              title: 'Premium Quality',
              description: 'Built with high-grade materials for durability and long-lasting performance.',
              icon: Lock
            },
            {
              title: 'Easy Cleaning Tools',
              description: 'Keep your car and bike spotless with our smart microfiber and cleaning solutions.',
              icon: Network
            },
            {
              title: 'Perfect Fit & Design',
              description: 'Products designed to match your vehicle perfectly with a premium look.',
              icon: CreditCard
            },
            {
              title: 'Affordable Pricing',
              description: 'Get the best value with quality products at competitive prices.',
              icon: CircleDollarSign
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-[250px] w-full cursor-pointer [perspective:1000px]"
            >
              <div className="absolute inset-0 w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-sm hover:shadow-xl rounded-2xl">
                {/* Front */}
                <div className="absolute inset-0 w-full h-full bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
                  <item.icon className="text-brand-yellow mb-4" size={32} />
                  <h3 className="text-lg font-bold text-brand-black mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 w-full h-full bg-brand-yellow rounded-2xl p-6 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] border border-brand-yellow">
                  <item.icon className="text-white mb-4" size={32} />
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6 lg:pl-10"
        >
          <h4 className="text-brand-yellow font-bold uppercase tracking-wider text-sm">
            All Features
          </h4>
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black leading-tight">
            Upgrade Your Ride with RoadsRide
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Discover premium car and bike accessories designed for performance, comfort, and style. From cleaning essentials to smart upgrades, RoadsRide helps you keep your vehicle in top condition every day.
          </p>
          <div className="pt-4">
            <Link href="/shop" className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors">
              Shop Now
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Secondary Layout Image / Extra section if provided */}
      {secondaryImage && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <img src={secondaryImage} alt="About RoadsRide" className="w-full h-auto object-cover max-h-[600px]" />
        </motion.div>
      )}

    </div>
  );
}
