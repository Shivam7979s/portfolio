import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 0. Seed Admin User
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log('Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@portfolio.com',
        password: hashedPassword,
      },
    });
    console.log('✅ Admin user created: admin@portfolio.com / admin123');
  } else {
    console.log('Admin user already exists.');
  }

  // 1. Seed HeroSection (Singleton: check if id 1 exists)
  const heroCount = await prisma.heroSection.count();
  if (heroCount === 0) {
    console.log('Creating default HeroSection...');
    await prisma.heroSection.create({
      data: {
        id: 1,
        name: 'Shivam',
        title: 'Engineering Intelligent Experiences.',
        subtitle: 'Available for Opportunities',
        description: "I'm Shivam, a full-stack architect specializing in AI integrations, high-performance computing, and cinematic web interfaces. Building the future, pixel by pixel.",
        buttons: JSON.stringify([
          { label: 'Explore My Work', action: 'scroll', target: '#projects', primary: true },
          { label: 'Initialize Contact', action: 'scroll', target: '#contact', primary: false },
        ]),
        socialLinks: JSON.stringify([
          { platform: 'github', url: 'https://github.com/ShivamSingh' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
          { platform: 'twitter', url: 'https://twitter.com' },
        ]),
        bgImage: '',
        bgVideo: '',
        profileImage: '',
        settings3D: JSON.stringify({ cameraZ: 5, particleCount: 1000, interactive: true }),
      },
    });
  } else {
    console.log('HeroSection already exists.');
  }

  // 2. Seed AboutSection (Singleton)
  const aboutCount = await prisma.aboutSection.count();
  if (aboutCount === 0) {
    console.log('Creating default AboutSection...');
    await prisma.aboutSection.create({
      data: {
        id: 1,
        title: '02. Background',
        description: 'A passionate systems builder and computer engineering enthusiast who builds robust full-stack infrastructures.',
        statsCards: JSON.stringify([
          { label: 'Completed Projects', value: '15+', icon: 'Briefcase' },
          { label: 'Tech Badges', value: '30+', icon: 'Award' },
          { label: 'Coding Problems', value: '1200+', icon: 'Code2' },
        ]),
        highlights: JSON.stringify([
          'Experienced in scalable Node.js/Java backends',
          'Deep expertise in relational databases and ORMs',
          'Creates beautiful frontends with Framer Motion and Three.js',
        ]),
        personalBio: 'I focus on developing optimized systems that provide beautiful UX. I believe in clean code, robust architecture, and dynamic automation.',
        profileImage: '',
      },
    });
  } else {
    console.log('AboutSection already exists.');
  }

  // 3. Seed SocialLinks (Singleton)
  const socialCount = await prisma.socialLinks.count();
  if (socialCount === 0) {
    console.log('Creating default SocialLinks...');
    await prisma.socialLinks.create({
      data: {
        id: 1,
        github: 'https://github.com/ShivamSingh',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
        portfolio: 'http://localhost:5173',
        youtube: '',
        leetcode: 'https://leetcode.com',
        codeforces: '',
      },
    });
  } else {
    console.log('SocialLinks already exists.');
  }

  // 4. Seed Settings (Singleton)
  const settingsCount = await prisma.settings.count();
  if (settingsCount === 0) {
    console.log('Creating default Settings...');
    await prisma.settings.create({
      data: {
        id: 1,
        themeColors: JSON.stringify({
          primary: '#8b5cf6',
          secondary: '#06b6d4',
          background: '#020208',
          accent: '#ec4899',
        }),
        logoText: 'Shivam Singh',
        logoImage: '',
        seoTitle: 'Shivam Singh | Cinematic Portfolio',
        seoDescription: 'Portfolio of Shivam Singh, Fullstack Engineer and AI Architect.',
        seoKeywords: 'React, Node.js, Express, MySQL, Three.js, Prisma, Fullstack',
        favicon: '',
        openGraphImage: '',
        customCursor: true,
        particleEffects: true,
        contactEmail: 'shivam.singh9798218@gmail.com',
        contactPhone: '+91-XXXXXXXXXX',
        contactLocation: 'Delhi, India',
        contactCTA: "Let's build something epic together!",
      },
    });
  } else {
    console.log('Settings already exists.');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
