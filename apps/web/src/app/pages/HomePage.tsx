import React from 'react';
import MetaTags from '../../components/ui/MetaTags';
import {
  HeroSection,
  VehicleFinderSection,
  FeaturedProductsSection,
  PopularCategoriesSection,
  PopularBrandsSection,
  VehicleBrandsSection,
  TrustSection,
} from '../components/home/HomeSections';

const HomePage: React.FC = () => (
  <>
    <MetaTags
      title="Trang chủ"
      description="Cung cấp phụ tùng ô tô chính hãng. Tra cứu theo hãng xe, mã OEM. Giao hàng toàn quốc."
    />
    <HeroSection />
    <VehicleFinderSection />
    <FeaturedProductsSection />
    <PopularCategoriesSection />
    <PopularBrandsSection />
    <VehicleBrandsSection />
    <TrustSection />
  </>
);

export default HomePage;
