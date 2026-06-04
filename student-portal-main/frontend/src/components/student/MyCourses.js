// src/components/student/MyCourses.js
import React from 'react';

const MyCourses = () => {
  // Course data based on your PDF
  const courses = [
    {
      id: 1,
      title: "Web Development (MERN Stack)",
      options: [
        {
          type: "2-Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 16,000",
          tools: "HTML, CSS, Intro to JS, Full MERN Stack (React, Node, Mongo, Deployment)",
          outcome: "Strong foundation in frontend + basic projects"
        },
        {
          type: "3-Month Training Series",
          duration: "3 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 21,000",
          tools: "HTML, CSS, Intro to JS, Full MERN Stack (React, Node, Mongo, Deployment)",
          outcome: "Functional websites + internship ready projects"
        },
        {
          type: "Pro-20 Training Series",
          duration: "3 Months",
          dailyTime: "8 hrs",
          fee: "Rs. 35,000",
          tools: "HTML, CSS, Intro to JS, Full MERN Stack (React, Node, Mongo, Deployment)",
          outcome: "Job-ready portfolio + freelance starter kit"
        }
      ]
    },
    {
      id: 2,
      title: "App Development",
      options: [
        {
          type: "2-Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 16,000",
          tools: "UI Components, Navigation, Styling, State, API Integration, Firebase, Push Notifications, Data handling with Redux & APIs, Testing & Deployment, Real-time project",
          outcome: "Mobile app basics + simple UI projects"
        },
        {
          type: "3-Month Training Series",
          duration: "3 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 21,000",
          tools: "UI Components, Navigation, Styling, State, API Integration, Firebase, Push Notifications, Data handling with Redux & APIs, Testing & Deployment, Real-time project",
          outcome: "Functional cross-platform apps + internship"
        },
        {
          type: "Pro-20 Training Series",
          duration: "3 Months",
          dailyTime: "8 hrs",
          fee: "Rs. 35,000",
          tools: "UI Components, Navigation, Styling, State, API Integration, Firebase, Push Notifications, Data handling with Redux & APIs, Testing & Deployment, Real-time project",
          outcome: "Job-ready apps + freelancing starter pack"
        }
      ]
    },
    {
      id: 3,
      title: "Graphic Designing",
      options: [
        {
          type: "2-Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 16,000",
          tools: "Adobe Photoshop, Illustrator, Canva, Figma Basics, Branding Essentials, Social Media Design, Portfolio Projects",
          outcome: "Design basics + simple UI projects"
        },
        {
          type: "3-Month Training Series",
          duration: "3 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 21,000",
          tools: "Adobe Photoshop, Illustrator, Canva, Figma Basics, Branding Essentials, Social Media Design, Portfolio Projects",
          outcome: "Functional brand designs + internship opportunity"
        },
        {
          type: "Pro-20 Training Series",
          duration: "3 Months",
          dailyTime: "8 hrs",
          fee: "Rs. 35,000",
          tools: "Adobe Photoshop, Illustrator, Canva, Figma Basics, Branding Essentials, Social Media Design, Portfolio Projects",
          outcome: "Job-ready portfolio + freelancing starter pack"
        }
      ]
    },
    {
      id: 4,
      title: "Digital Marketing",
      options: [
        {
          type: "2-Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 16,000",
          tools: "Meta Ads (Facebook & Instagram), Social Media Marketing (Paid & Organic), Search Engine Optimization (SEO), Google Ads & Analytics, Content Strategy & Branding",
          outcome: "Basic social & search campaigns, Organic + paid strategy skills, Content calendar creation, Internship-ready portfolio"
        },
        {
          type: "3-Month Training Series",
          duration: "3 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 21,000",
          tools: "Meta Ads (Facebook & Instagram), Social Media Marketing (Paid & Organic), Search Engine Optimization (SEO), Google Ads & Analytics, Content Strategy & Branding",
          outcome: "Advanced ad campaign handling, Conversion-based strategies, Real projects + freelance toolkit, Client reporting & placements"
        },
        {
          type: "Pro-20 Training Series",
          duration: "3 Months",
          dailyTime: "8 hrs",
          fee: "Rs. 35,000",
          tools: "Meta Ads (Facebook & Instagram), Social Media Marketing (Paid & Organic), Search Engine Optimization (SEO), Google Ads & Analytics, Content Strategy & Branding",
          outcome: "Advanced ad campaign handling, Conversion-based strategies, Real projects + freelance toolkit, Client reporting & placements"
        }
      ]
    },
    {
      id: 5,
      title: "Shopify / Ecommerce",
      options: [
        {
          type: "2 Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 16,000",
          tools: "Shopify Store Setup & Theme Customization, Product Listing & Inventory Management, Payment Gateway & Shipping Settings, Order Handling & Customer Support, E-commerce Marketing (FB Ads, Email, SEO), Store Automation & Analytics",
          outcome: "Complete Shopify store setup, E-commerce management skills, Marketing and analytics knowledge"
        }
      ]
    },
    {
      id: 6,
      title: "Business Development",
      options: [
        {
          type: "1-Month Training Series",
          duration: "1 Month",
          dailyTime: "2 hrs",
          fee: "Rs. 15,000",
          tools: "Work on Upwork, Fiverr, LinkedIn & Indeed, Proposal Writing & Business Communication, Client Handling & Negotiation Techniques, Freelancing Tools & Strategy Building",
          outcome: "Strong BD basics + communication practice, Freelancing-ready profile + real client strategy projects"
        }
      ]
    },
    {
      id: 7,
      title: "ICR For Kids",
      options: [
        {
          type: "2-Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 10,000",
          tools: "Basic Graphic Designing, Video Editing + Computer Basics, Web Development (HTML/CSS Basics), English Language & Typing Practice, YouTube & Social Media Fun Learning, AI Tools like ChatGPT & More, Tech Trends for Young Minds",
          outcome: "Digital skills fun-based introduction, Boost in creativity, typing & confidence, Tech awareness from an early age"
        }
      ]
    },
    {
      id: 8,
      title: "YouTube Automation",
      options: [
        {
          type: "1-Month Training Series",
          duration: "1 Month",
          dailyTime: "2 hrs",
          fee: "Rs. 20,000",
          tools: "YouTube Niche & Channel Strategy, Scriptwriting & AI Tools, Voiceover & Editing Workflow, Monetization, Growth & Scaling",
          outcome: "Channel-ready skills to start automation, AI-powered content planning & production, Monetization complete roadmap"
        }
      ]
    },
    {
      id: 9,
      title: "UI/UX Design",
      options: [
        {
          type: "1-Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 15,000",
          tools: "UI Design Principles & Layouts, User Research & Wireframing, Figma Tools & Prototypes, Mobile & Web App Interface Design",
          outcome: "Design functional app & web UI, Build clickable prototypes in Figma, Ready for internships & freelance gigs"
        }
      ]
    },
    {
      id: 10,
      title: "English Language",
      options: [
        {
          type: "2-Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 20,000",
          tools: "Grammar & Vocabulary, Reading, Writing, Speaking Practice",
          outcome: "Improved fluency & sentence structure, Confident communication in English"
        }
      ]
    },
    {
      id: 11,
      title: "IELTS",
      options: [
        {
          type: "2-Month Training Series",
          duration: "2 Months",
          dailyTime: "2 hrs",
          fee: "Rs. 25,000",
          tools: "IELTS Listening, Reading, Writing & Speaking, Timed Mock Tests, Exam Strategies & Band Score Tips, Speaking Fluency & Essay Writing Practice",
          outcome: "Familiarity with actual IELTS format, Better time & pressure management, Band-focused preparation for study/work abroad"
        }
      ]
    }
  ];

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Our Courses</h1>
        <p>Comprehensive IT training programs designed to launch your career in technology</p>
      </div>

      <div className="courses-container">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h2>{course.title}</h2>
            </div>
            
            <div className="course-options">
              {course.options.map((option, index) => (
                <div key={index} className="course-option">
                  <div className="option-header">
                    <h3>{option.type}</h3>
                    <span className="fee-badge">{option.fee}</span>
                  </div>
                  
                  <div className="option-details">
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{option.duration}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Daily Time:</span>
                      <span className="detail-value">{option.dailyTime}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Tools & Topics:</span>
                      <span className="detail-value">{option.tools}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Outcome:</span>
                      <span className="detail-value">{option.outcome}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="courses-footer">
        <h3>Why Choose Our Courses?</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <i className="fas fa-graduation-cap"></i>
            <h4>Expert Instructors</h4>
            <p>Learn from industry professionals with years of experience</p>
          </div>
          <div className="benefit-item">
            <i className="fas fa-briefcase"></i>
            <h4>Career Support</h4>
            <p>Get placement assistance and career guidance</p>
          </div>
          <div className="benefit-item">
            <i className="fas fa-laptop-code"></i>
            <h4>Hands-on Projects</h4>
            <p>Work on real-world projects to build your portfolio</p>
          </div>
          <div className="benefit-item">
            <i className="fas fa-certificate"></i>
            <h4>Certification</h4>
            <p>Receive a recognized certificate upon completion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;