import {
  PrismaClient,
  UserRole,
  UserStatus,
  CategoryType,
  SizeEnum,
  ColorEnum,
  ProductStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu Seeding Dữ Liệu Seoul Blanc ---');

  // 1. Tạo tài khoản Admin & User
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: hashedPasswordAdmin,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: 'Seoul Blanc Admin',
      email: 'admin@gmail.com',
      password: hashedPasswordAdmin,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      gender: 'OTHER',
    },
  });
  console.log('✓ Admin user sẵn sàng:', admin.email);

  const hashedPasswordUser = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {
      password: hashedPasswordUser,
      role: UserRole.USER,
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: 'Seoul Blanc Customer',
      email: 'user@gmail.com',
      password: hashedPasswordUser,
      role: UserRole.USER,
      phoneNumber: '0901234567',
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      gender: 'FEMALE',
    },
  });
  console.log('✓ Client user sẵn sàng:', user.email);

  // 2. Tạo Danh Mục Sản Phẩm (Categories)
  const categoriesData = [
    {
      name: 'Áo Thun & Polo',
      slug: 'ao-thun-polo',
      type: CategoryType.TOPS,
      description: 'Bộ sưu tập áo thun cotton và áo polo phong cách tối giản thanh lịch.',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Áo Sơ Mi Hàn Quốc',
      slug: 'ao-so-mi',
      type: CategoryType.TOPS,
      description: 'Áo sơ mi lụa, sơ mi Oxford dáng suông chuẩn phong cách Seoul.',
      image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Quần Jeans & Denim',
      slug: 'quan-jeans',
      type: CategoryType.BOTTOMS,
      description: 'Quần jeans ống rộng, cạp cao tôn dáng, chất liệu denim cao cấp.',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Quần Tây Âu & Kaki',
      slug: 'quan-tay-kaki',
      type: CategoryType.BOTTOMS,
      description: 'Quần tây xếp ly, form dáng hiện đại phù hợp đi làm và dạo phố.',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Áo Khoác & Blazer',
      slug: 'ao-khoac-blazer',
      type: CategoryType.OUTERWEAR,
      description: 'Áo blazer oversized, áo khoác dạ ấm áp và phong thái lịch thiệp.',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Áo Cardigan & Len Dệt',
      slug: 'ao-cardigan-len',
      type: CategoryType.OUTERWEAR,
      description: 'Áo cardigan len mềm mại, tông màu pastel nhẹ nhàng chuẩn Hàn Quốc.',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Đầm Dáng Suông Tối Giản',
      slug: 'dam-dang-suong',
      type: CategoryType.DRESSES,
      description: 'Đầm suông thiết kế thanh thoát, chất vải thoáng mát nhẹ nhàng.',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Đầm Hoa Nhí & Đi Tiệc',
      slug: 'dam-hoa-nhi',
      type: CategoryType.DRESSES,
      description: 'Đầm nữ tính, họa tiết vintage tinh xảo cho các buổi hẹn hò và dạ tiệc.',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        type: cat.type,
        description: cat.description,
        image: cat.image,
      },
      create: cat,
    });
    categoriesMap[cat.slug] = created.id;
  }
  console.log(`✓ Đã tạo/cập nhật ${Object.keys(categoriesMap).length} danh mục.`);

  // 3. Tạo Sản Phẩm & Biến Thể (Products & ProductVariants)
  const productsData = [
    {
      name: 'Áo Thun Cotton Heavyweight Seoul Basic',
      slug: 'ao-thun-cotton-heavyweight-seoul-basic',
      categorySlug: 'ao-thun-polo',
      price: 290000,
      discountPrice: 249000,
      description:
        'Áo thun cotton 100% định lượng 250gsm dập dệt dày dặn, form boxy trẻ trung. Khả năng thấm hút mồ hôi tốt, chống xù lông, viền cổ may bo dệt kép giữ form sau nhiều lần giặt.',
      material: '100% Cotton 2-chiều 250gsm',
      fit: 'Boxy / Oversized Fit',
      style: 'Minimalism, Korean Streetwear',
      tags: ['ao thun', 'cotton', 'oversized', 'basic', 'unisex'],
      thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.S, color: ColorEnum.WHITE, stock: 50, sku: 'TS-HW-WHT-S' },
        { size: SizeEnum.M, color: ColorEnum.WHITE, stock: 45, sku: 'TS-HW-WHT-M' },
        { size: SizeEnum.L, color: ColorEnum.WHITE, stock: 30, sku: 'TS-HW-WHT-L' },
        { size: SizeEnum.M, color: ColorEnum.BLACK, stock: 40, sku: 'TS-HW-BLK-M' },
        { size: SizeEnum.L, color: ColorEnum.BLACK, stock: 35, sku: 'TS-HW-BLK-L' },
        { size: SizeEnum.M, color: ColorEnum.GRAY, stock: 25, sku: 'TS-HW-GRY-M' },
      ],
    },
    {
      name: 'Áo Sơ Mi Oxford Form Rộng Tối Giản',
      slug: 'ao-so-mi-oxford-form-rong-toi-gian',
      categorySlug: 'ao-so-mi',
      price: 450000,
      discountPrice: 389000,
      description:
        'Áo sơ mi vải Oxford dệt thô tự nhiên, bề mặt có gân sang trọng, đứng form. Dáng thả rộng phóng khoáng, dễ dàng mix layer cùng áo thun hoặc mặc đóng thùng thanh lịch.',
      material: 'Vải Cotton Oxford nhập khẩu',
      fit: 'Relaxed Fit',
      style: 'Smart Casual, Korean Minimalist',
      tags: ['so mi', 'oxford', 'cong so', 'thanh lich'],
      thumbnail: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.M, color: ColorEnum.WHITE, stock: 35, sku: 'SM-OX-WHT-M' },
        { size: SizeEnum.L, color: ColorEnum.WHITE, stock: 30, sku: 'SM-OX-WHT-L' },
        { size: SizeEnum.M, color: ColorEnum.BLUE, stock: 25, sku: 'SM-OX-BLU-M' },
        { size: SizeEnum.L, color: ColorEnum.BLUE, stock: 20, sku: 'SM-OX-BLU-L' },
        { size: SizeEnum.M, color: ColorEnum.BEIGE, stock: 20, sku: 'SM-OX-BGE-M' },
      ],
    },
    {
      name: 'Quần Jeans Ống Suông Vintage Wide-Leg',
      slug: 'quan-jeans-ong-suong-vintage-wide-leg',
      categorySlug: 'quan-jeans',
      price: 520000,
      discountPrice: null,
      description:
        'Quần denim cạp cao dáng suông thẳng tắp, hiệu ứng wash màu xanh nhạt cổ điển. Chất vải jeans 13oz bền chắc không co rút, tôn chiều cao tuyệt đối.',
      material: '100% Cotton Denim 13oz',
      fit: 'Straight Wide-Leg',
      style: 'Vintage Y2K, Korean Streetwear',
      tags: ['quan jeans', 'ong rong', 'denim', 'vintage'],
      thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.S, color: ColorEnum.BLUE, stock: 25, sku: 'JN-WL-BLU-S' },
        { size: SizeEnum.M, color: ColorEnum.BLUE, stock: 40, sku: 'JN-WL-BLU-M' },
        { size: SizeEnum.L, color: ColorEnum.BLUE, stock: 30, sku: 'JN-WL-BLU-L' },
        { size: SizeEnum.M, color: ColorEnum.BLACK, stock: 30, sku: 'JN-WL-BLK-M' },
        { size: SizeEnum.L, color: ColorEnum.BLACK, stock: 20, sku: 'JN-WL-BLK-L' },
      ],
    },
    {
      name: 'Quần Tây Xếp Ly Form Rộng Pleated Trouser',
      slug: 'quan-tay-xep-ly-form-rong-pleated-trouser',
      categorySlug: 'quan-tay-kaki',
      price: 490000,
      discountPrice: 420000,
      description:
        'Quần âu xếp 2 ly trước tạo độ rủ mềm mại, ống rộng che khuyết điểm chân hoàn hảo. Chất vải tuýt-si co giãn nhẹ, giữ nếp thẳng tắp suốt ngày dài.',
      material: 'Vải Tuýt-si cao cấp (65% Poly, 35% Rayon)',
      fit: 'Wide Leg Tailored',
      style: 'Modern Classic, Chic Office',
      tags: ['quan tay', 'pleated', 'ong rong', 'cong so'],
      thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.S, color: ColorEnum.BLACK, stock: 30, sku: 'TR-PL-BLK-S' },
        { size: SizeEnum.M, color: ColorEnum.BLACK, stock: 45, sku: 'TR-PL-BLK-M' },
        { size: SizeEnum.L, color: ColorEnum.BLACK, stock: 30, sku: 'TR-PL-BLK-L' },
        { size: SizeEnum.M, color: ColorEnum.BEIGE, stock: 35, sku: 'TR-PL-BGE-M' },
        { size: SizeEnum.L, color: ColorEnum.BEIGE, stock: 25, sku: 'TR-PL-BGE-L' },
        { size: SizeEnum.M, color: ColorEnum.GRAY, stock: 20, sku: 'TR-PL-GRY-M' },
      ],
    },
    {
      name: 'Áo Blazer Hai Hàng Khuy Double-Breasted Seoul',
      slug: 'ao-blazer-hai-hang-khuy-double-breasted-seoul',
      categorySlug: 'ao-khoac-blazer',
      price: 890000,
      discountPrice: 799000,
      description:
        'Thiết kế áo blazer 2 hàng khuy cổ điển mang hơi thở hiện đại. Đệm vai mỏng tạo phom vuông vức, lót lụa habutai êm ái thoáng khí bên trong.',
      material: 'Wool Blend cao cấp lót lụa Habutai',
      fit: 'Oversized Blazer',
      style: 'High Fashion, Office Chic',
      tags: ['blazer', 'ao vest', 'outerwear', 'sang trong'],
      thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.S, color: ColorEnum.BLACK, stock: 15, sku: 'BLZ-DB-BLK-S' },
        { size: SizeEnum.M, color: ColorEnum.BLACK, stock: 25, sku: 'BLZ-DB-BLK-M' },
        { size: SizeEnum.L, color: ColorEnum.BLACK, stock: 20, sku: 'BLZ-DB-BLK-L' },
        { size: SizeEnum.M, color: ColorEnum.BEIGE, stock: 20, sku: 'BLZ-DB-BGE-M' },
        { size: SizeEnum.L, color: ColorEnum.BEIGE, stock: 15, sku: 'BLZ-DB-BGE-L' },
        { size: SizeEnum.M, color: ColorEnum.NAVY, stock: 15, sku: 'BLZ-DB-NVY-M' },
      ],
    },
    {
      name: 'Áo Cardigan Dệt Kim Cổ Tim V-Neck Mềm',
      slug: 'ao-cardigan-det-kim-co-tim-v-neck-mem',
      categorySlug: 'ao-cardigan-len',
      price: 480000,
      discountPrice: 399000,
      description:
        'Áo khoác len cardigan dệt sợi bông chải kỹ mềm mịn như mây. Hàng cúc sừng vintage, viền gấu bo thun co giãn thoải mái, giữ ấm dịu nhẹ trong ngày se lạnh.',
      material: 'Sợi Acrylic & Cotton dệt kim mịn',
      fit: 'Loose Fit',
      style: 'Cozy, Soft Aesthetic, Korean Look',
      tags: ['cardigan', 'ao len', 'mua thu', 'vintage'],
      thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.S, color: ColorEnum.BEIGE, stock: 20, sku: 'CDG-VN-BGE-S' },
        { size: SizeEnum.M, color: ColorEnum.BEIGE, stock: 35, sku: 'CDG-VN-BGE-M' },
        { size: SizeEnum.L, color: ColorEnum.BEIGE, stock: 20, sku: 'CDG-VN-BGE-L' },
        { size: SizeEnum.M, color: ColorEnum.GRAY, stock: 25, sku: 'CDG-VN-GRY-M' },
        { size: SizeEnum.M, color: ColorEnum.BROWN, stock: 20, sku: 'CDG-VN-BRN-M' },
      ],
    },
    {
      name: 'Đầm Suông Linen Tối Giản Dáng Dài',
      slug: 'dam-suong-linen-toi-gian-dang-dai',
      categorySlug: 'dam-dang-suong',
      price: 580000,
      discountPrice: 499000,
      description:
        'Chiếc đầm linen mộc mạc đem lại cảm giác thoáng mát và phong thái tao nhã tự nhiên. Cắt may tinh tế không kén dáng người, túi ẩn hai bên hông tiện dụng.',
      material: '100% Premium Linen (Vải Đũi Tự Nhiên)',
      fit: 'Relaxed A-Line Dress',
      style: 'Minimalism, Pure Nature',
      tags: ['dam linen', 'vay suong', 'mua he', 'nhe nhang'],
      thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.S, color: ColorEnum.BEIGE, stock: 25, sku: 'DRS-LN-BGE-S' },
        { size: SizeEnum.M, color: ColorEnum.BEIGE, stock: 30, sku: 'DRS-LN-BGE-M' },
        { size: SizeEnum.L, color: ColorEnum.BEIGE, stock: 15, sku: 'DRS-LN-BGE-L' },
        { size: SizeEnum.S, color: ColorEnum.WHITE, stock: 20, sku: 'DRS-LN-WHT-S' },
        { size: SizeEnum.M, color: ColorEnum.WHITE, stock: 25, sku: 'DRS-LN-WHT-M' },
        { size: SizeEnum.M, color: ColorEnum.BLACK, stock: 20, sku: 'DRS-LN-BLK-M' },
      ],
    },
    {
      name: 'Đầm Hoa Nhí Cổ V Thắt Nơ Eo French Vintage',
      slug: 'dam-hoa-nhi-co-v-that-no-eo-french-vintage',
      categorySlug: 'dam-hoa-nhi',
      price: 650000,
      discountPrice: null,
      description:
        'Họa tiết hoa nhí nhã nhặn trên nền vải voan cát mềm lượn sóng. Thiết kế thắt nơ tinh tế vòng eo tạo hiệu ứng thon thả, bay bổng theo từng bước đi.',
      material: 'Chiffon cát lụa cao cấp có lót trong',
      fit: 'Flattering Waist Fit',
      style: 'French Vintage, Romantic Seoul',
      tags: ['dam hoa nhi', 'vintage', 'di tiec', 'nu tinh'],
      thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.S, color: ColorEnum.PINK, stock: 20, sku: 'DRS-FL-PNK-S' },
        { size: SizeEnum.M, color: ColorEnum.PINK, stock: 30, sku: 'DRS-FL-PNK-M' },
        { size: SizeEnum.L, color: ColorEnum.PINK, stock: 15, sku: 'DRS-FL-PNK-L' },
        { size: SizeEnum.M, color: ColorEnum.BLUE, stock: 20, sku: 'DRS-FL-BLU-M' },
      ],
    },
    {
      name: 'Áo Polo Dệt Len Bo Cổ Retro Classic',
      slug: 'ao-polo-det-len-bo-co-retro-classic',
      categorySlug: 'ao-thun-polo',
      price: 380000,
      discountPrice: 320000,
      description:
        'Áo len tăm polo dáng ôm nhẹ, thiết kế cổ bẻ dệt tương phản phong cách retro. Phù hợp cho cả trang phục công sở nhẹ nhàng lẫn dạo phố cuối tuần.',
      material: 'Sợi Cotton pha Viscose thoáng mát',
      fit: 'Slim-Regular Fit',
      style: 'Retro Chic, Clean Fit',
      tags: ['polo', 'ao thun co be', 'retro', 'thanh lich'],
      thumbnail: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.M, color: ColorEnum.BLACK, stock: 30, sku: 'PL-RT-BLK-M' },
        { size: SizeEnum.L, color: ColorEnum.BLACK, stock: 25, sku: 'PL-RT-BLK-L' },
        { size: SizeEnum.M, color: ColorEnum.BEIGE, stock: 25, sku: 'PL-RT-BGE-M' },
        { size: SizeEnum.L, color: ColorEnum.BEIGE, stock: 20, sku: 'PL-RT-BGE-L' },
        { size: SizeEnum.M, color: ColorEnum.GREEN, stock: 20, sku: 'PL-RT-GRN-M' },
      ],
    },
    {
      name: 'Áo Khoác Bomber Thêu Logo Tối Giản',
      slug: 'ao-khoac-bomber-theu-logo-toi-gian',
      categorySlug: 'ao-khoac-blazer',
      price: 750000,
      discountPrice: 650000,
      description:
        'Áo khoác bomber chất vải dù 2 lớp cản gió và chống nước nhẹ. Khóa kéo kim loại hai chiều cao cấp, đường may tỉ mỉ tạo form phồng chuẩn phong cách streetwear.',
      material: 'Poly Taslan chống gió & lớp lót nỉ mịn',
      fit: 'Boxy Bomber Fit',
      style: 'Streetwear, Urban Modern',
      tags: ['bomber', 'ao khoac', 'chong gio', 'streetwear'],
      thumbnail: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { size: SizeEnum.M, color: ColorEnum.BLACK, stock: 30, sku: 'JK-BM-BLK-M' },
        { size: SizeEnum.L, color: ColorEnum.BLACK, stock: 30, sku: 'JK-BM-BLK-L' },
        { size: SizeEnum.XL, color: ColorEnum.BLACK, stock: 15, sku: 'JK-BM-BLK-XL' },
        { size: SizeEnum.M, color: ColorEnum.GREEN, stock: 20, sku: 'JK-BM-GRN-M' },
        { size: SizeEnum.L, color: ColorEnum.GREEN, stock: 15, sku: 'JK-BM-GRN-L' },
      ],
    },
  ];

  for (const item of productsData) {
    const categoryId = categoriesMap[item.categorySlug];
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        categoryId,
        price: item.price,
        discountPrice: item.discountPrice,
        description: item.description,
        material: item.material,
        fit: item.fit,
        style: item.style,
        tags: item.tags,
        thumbnail: item.thumbnail,
        images: item.images,
        status: ProductStatus.ACTIVE,
      },
      create: {
        name: item.name,
        slug: item.slug,
        categoryId,
        price: item.price,
        discountPrice: item.discountPrice,
        description: item.description,
        material: item.material,
        fit: item.fit,
        style: item.style,
        tags: item.tags,
        thumbnail: item.thumbnail,
        images: item.images,
        status: ProductStatus.ACTIVE,
        ratingAverage: 4.8,
        totalReviews: 12,
        sold: 28,
      },
    });

    // Tạo các variants tương ứng
    for (const v of item.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          stock: v.stock,
          size: v.size,
          color: v.color,
          productId: product.id,
        },
        create: {
          sku: v.sku,
          stock: v.stock,
          size: v.size,
          color: v.color,
          productId: product.id,
        },
      });
    }
  }
  console.log(`✓ Đã tạo/cập nhật ${productsData.length} sản phẩm cùng các biến thể.`);

  // 4. Tạo Mã Giảm Giá (Vouchers)
  const vouchersData = [
    {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 200000,
      maxDiscount: 50000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-12-31'),
      usageLimit: 500,
      usageCount: 0,
      status: 'ACTIVE',
    },
    {
      code: 'SEOUL50K',
      discountType: 'FIXED',
      discountValue: 50000,
      minOrderValue: 400000,
      maxDiscount: null,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-12-31'),
      usageLimit: 200,
      usageCount: 0,
      status: 'ACTIVE',
    },
    {
      code: 'FREESHIP',
      discountType: 'FIXED',
      discountValue: 30000,
      minOrderValue: 150000,
      maxDiscount: null,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-12-31'),
      usageLimit: 1000,
      usageCount: 0,
      status: 'ACTIVE',
    },
    {
      code: 'VIP15',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 600000,
      maxDiscount: 120000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-12-31'),
      usageLimit: 100,
      usageCount: 0,
      status: 'ACTIVE',
    },
  ];

  for (const v of vouchersData) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: {
        discountType: v.discountType,
        discountValue: v.discountValue,
        minOrderValue: v.minOrderValue,
        maxDiscount: v.maxDiscount,
        startDate: v.startDate,
        endDate: v.endDate,
        usageLimit: v.usageLimit,
        status: v.status,
      },
      create: v,
    });
  }
  console.log(`✓ Đã tạo/cập nhật ${vouchersData.length} mã voucher khuyến mãi.`);

  console.log('--- Hoàn tất Seeding Dữ Liệu Seoul Blanc thành công! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seeding dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
