import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading';
import ContactForm from './ContactForm';

export default function ContactUs() {
  const contactDetails = [
    {
      icon: MapPin,
      title: 'Our Office',
      desc: 'Makarba, Ahmedabad, Gujarat, India - 380051'
    },
    {
      icon: Phone,
      title: 'Phone Number',
      desc: '+91 98765 43210 (Mon-Sat, 9AM-6PM)'
    },
    {
      icon: Mail,
      title: 'Email Address',
      desc: 'info@beingkind.org'
    },
    {
      icon: Clock,
      title: 'Office Hours',
      desc: 'Monday - Saturday: 9:00 AM - 6:00 PM (Emergency helpline 24/7)'
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      
      {/* 1. Header Banner */}
      <section className="py-16 bg-neutral-bg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Get in Touch with Us" 
            subtitle="Contact Us"
            align="left"
          />
          <p className="max-w-3xl text-gray-500 text-lg md:text-xl font-light leading-relaxed">
            Have questions about volunteering, donations, or campaigns? Or need to report an animal in distress in Ahmedabad? Drop us a line below or reach out directly.
          </p>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                We'd love to hear from you. Whether you want to support our feeding programs, run a legal awareness workshop, or suggest a volunteer drive.
              </p>
            </div>

            <div className="space-y-8">
              {contactDetails.map((detail, idx) => {
                const Icon = detail.icon;
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base mb-1">{detail.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{detail.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form Wrapper */}
          <div className="lg:col-span-7 bg-neutral-bg border border-gray-100 p-8 md:p-12 rounded-3xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Send Us a Message</h3>
            <ContactForm />
          </div>

        </div>
      </section>

      {/* 3. Static Map Embed / Mock Block */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-3xl overflow-hidden h-[400px] border border-gray-200 relative flex items-center justify-center">
          {/* Visual representations of a maps outline */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/72.5022,23.0035,12,0/800x400?access_token=mock')` }} />
          
          <div className="relative z-10 bg-white/95 backdrop-blur-xs p-6 md:p-8 rounded-2xl max-w-sm text-center shadow-md border border-gray-100 mx-4">
            <MapPin className="text-primary w-8 h-8 mx-auto mb-3" />
            <h4 className="font-bold text-gray-900 mb-1">Being Kind HQ</h4>
            <p className="text-gray-500 text-xs leading-relaxed mb-3">
              Makarba, Ahmedabad, Gujarat, India - 380051
            </p>
            <a 
              href="https://maps.google.com/?q=Makarba,Ahmedabad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary font-bold hover:underline"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
