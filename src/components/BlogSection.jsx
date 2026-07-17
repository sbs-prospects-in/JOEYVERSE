import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogs = [
  {
    title: "10 Essential Signs Your Dog Needs to See a Vet",
    excerpt: "Learn how to spot the subtle behavioral changes that indicate your furry friend might need medical attention.",
    category: "Pet Health",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    title: "The Ultimate Guide to Feline Nutrition",
    excerpt: "Demystifying cat food labels and understanding exactly what nutrients your cat needs at every stage of life.",
    category: "Nutrition",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400",
    color: "bg-green-50 text-green-700 border-green-200"
  },
  {
    title: "Managing Anxiety in Rescue Pets",
    excerpt: "Practical strategies and expert advice for helping your new adopted pet settle into their forever home peacefully.",
    category: "Behavior",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400",
    color: "bg-purple-50 text-purple-700 border-purple-200"
  }
];

export default function BlogSection() {
  return (
    <section className="flex flex-col gap-8 sm:gap-10 py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <p className="text-[0.75rem] font-bold text-green-600 uppercase tracking-[0.1em] mb-1.5">
            ● Wellness Journal
          </p>
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold text-slate-900 m-0 tracking-tight">
            Latest from our Blogs
          </h2>
        </div>
        <Link to="/blogs" className="inline-flex items-center gap-1.5 text-[0.875rem] font-bold text-green-600 no-underline whitespace-nowrap border-[1.5px] border-green-300 px-4 py-2 rounded-full bg-green-50 transition-all hover:bg-green-100 self-start">
          View All Posts <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {blogs.map((blog, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
          >
            <Link to={`/blogs/${idx + 1}`} className="flex flex-col h-full text-current no-underline">
              {/* Image Container */}
              <div className="h-48 w-full overflow-hidden relative">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${blog.color}`}>
                    {blog.category}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 flex flex-col flex-grow gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Clock size={14} />
                  <span>{blog.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 m-0 leading-snug group-hover:text-indigo-600 transition-colors">
                  {blog.title}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed m-0 flex-grow">
                  {blog.excerpt}
                </p>
                
                <div className="mt-2 text-sm font-bold text-slate-800 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                  Read Article <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
