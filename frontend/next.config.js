/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: require('path').join(__dirname, '../'),
  
  async rewrites() {
    return [
      {
        source: '/api/agents/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
  
  // Optimize build performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // Reduce bundle size for editor libraries
  webpack: (config, { isServer }) => {
    // Externalize large editor packages in development
    if (!isServer && process.env.NODE_ENV === 'development') {
      config.externals = config.externals || []
      config.externals.push({
        'vditor': 'Vditor',
        '@mdxeditor/editor': 'MDXEditor'
      })
    }
    
    return config
  }
}

module.exports = nextConfig