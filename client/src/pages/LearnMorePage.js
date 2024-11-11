import React from 'react';

const articles = [
  {
    title: 'Water Conservation Facts and Tips',
    description: 'Learn how to reduce your water usage with these practical tips.',
    url: 'https://www.nationalgeographic.com/environment/article/water-conservation-tips',
  },
  {
    title: '45+ Ways to Conserve Water in the Home and Yard',
    description: 'Explore over 45 methods to save water both indoors and outdoors.',
    url: 'https://learn.eartheasy.com/guides/45-ways-to-conserve-water-in-the-home-and-yard/',
  },
  {
    title: 'How to Conserve Water: 11 Simple Water-Saving Tips',
    description: 'Implement these 11 straightforward tips to conserve water daily.',
    url: 'https://www.masterclass.com/articles/how-to-conserve-water',
  },
  {
    title: 'Start Saving - US EPA',
    description: 'Discover how to use water efficiently with guidance from the EPA.',
    url: 'https://www.epa.gov/watersense/start-saving',
  },
  {
    title: 'How to Cut Your Water Use in Half',
    description: 'Consumer Reports offers advice on reducing water consumption by 50%.',
    url: 'https://www.consumerreports.org/water-conservation/how-to-cut-your-water-use-in-half-a1121517078/',
  },
];

function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-500 mb-6">Learn More About Water Conservation</h1>
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        {articles.map((article, index) => (
          <div key={index} className="mb-4">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-blue-600 hover:underline">
              {article.title}
            </a>
            <p className="text-gray-700">{article.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LearnMorePage;
