// shortcut: illustrative catalog for the home page (labelled on screen); replace with the catalog service.

export const categories = [
  { slug: "literature", icon: "feather", tone: "bg-teal text-white" },
  { slug: "manga", icon: "zap", tone: "bg-ember text-night" },
  { slug: "children", icon: "rabbit", tone: "bg-gold text-night" },
  { slug: "history", icon: "landmark", tone: "bg-dusk text-white" },
  { slug: "science", icon: "telescope", tone: "bg-night text-crescent" },
  { slug: "business", icon: "trending", tone: "bg-teal text-white" },
  { slug: "selfhelp", icon: "sprout", tone: "bg-dusk text-white" },
  { slug: "secondhand", icon: "library", tone: "bg-ember text-night" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export const stores = [
  { code: "TH-0142", name: "Hiệu sách Gác Xép", genre: "literature", city: "Hà Nội", tone: "bg-teal text-white", verifiedOn: "03.2026" },
  { code: "TH-0311", name: "Kệ Truyện Tranh", genre: "manga", city: "TP.HCM", tone: "bg-dusk text-white", verifiedOn: "08.2026" },
  { code: "TH-0388", name: "Sách Bến Thuyền", genre: "history", city: "Đà Nẵng", tone: "bg-ember text-night", verifiedOn: "09.2026" },
  { code: "TH-0415", name: "Tiệm Sách Mưa", genre: "children", city: "Đà Lạt", tone: "bg-teal text-white", verifiedOn: "10.2026" },
] as const satisfies readonly {
  code: string;
  name: string;
  genre: CategorySlug;
  city: string;
  tone: string;
  verifiedOn: string;
}[];

type StoreCode = (typeof stores)[number]["code"];

// Typographic jackets, cloth colours from the Thoth palette.
export type CoverStyle = "band" | "frame" | "disc" | "stack";

export type Book = {
  id: string;
  title: string;
  author: string;
  store: StoreCode;
  price: number; // VND
  listPrice?: number; // VND, set when discounted
  cover: { style: CoverStyle; cloth: string; ink: string };
};

const book = (
  id: string,
  title: string,
  author: string,
  store: StoreCode,
  price: number,
  style: CoverStyle,
  cloth: string,
  ink: string,
  listPrice?: number,
): Book => ({ id, title, author, store, price, listPrice, cover: { style, cloth, ink } });

export const suggested: Book[] = [
  book("b01", "Tôi thấy hoa vàng trên cỏ xanh", "Nguyễn Nhật Ánh", "TH-0415", 125000, "disc", "bg-teal", "text-crescent"),
  book("b02", "Số đỏ", "Vũ Trọng Phụng", "TH-0142", 89000, "band", "bg-ember", "text-night"),
  book("b03", "Lược sử thời gian", "Stephen Hawking", "TH-0388", 145000, "stack", "bg-night", "text-gold"),
  book("b04", "Dế Mèn phiêu lưu ký", "Tô Hoài", "TH-0415", 68000, "frame", "bg-gold", "text-night"),
  book("b05", "Nhà giả kim", "Paulo Coelho", "TH-0142", 79000, "disc", "bg-dusk", "text-crescent"),
  book("b06", "Thám tử lừng danh Conan, tập 1", "Aoyama Gōshō", "TH-0311", 25000, "band", "bg-crescent", "text-night"),
];

export const newArrivals: Book[] = [
  book("b07", "Việt Nam sử lược", "Trần Trọng Kim", "TH-0388", 198000, "frame", "bg-night", "text-crescent"),
  book("b08", "Cây cam ngọt của tôi", "José Mauro de Vasconcelos", "TH-0415", 108000, "stack", "bg-teal", "text-moon"),
  book("b09", "Chí Phèo", "Nam Cao", "TH-0142", 55000, "band", "bg-dusk", "text-gold"),
  book("b10", "Doraemon, tập 1", "Fujiko F. Fujio", "TH-0311", 22000, "disc", "bg-ember", "text-moon"),
  book("b11", "Vũ trụ", "Carl Sagan", "TH-0388", 235000, "stack", "bg-gold", "text-night"),
  book("b12", "Truyện Kiều", "Nguyễn Du", "TH-0142", 96000, "frame", "bg-crescent", "text-dusk"),
];

export const deals: Book[] = [
  book("b13", "Đắc nhân tâm", "Dale Carnegie", "TH-0142", 76000, "band", "bg-teal", "text-gold", 95000),
  book("b14", "Totto-chan bên cửa sổ", "Kuroyanagi Tetsuko", "TH-0415", 72000, "disc", "bg-gold", "text-dusk", 98000),
  book("b15", "Sapiens: Lược sử loài người", "Yuval Noah Harari", "TH-0388", 189000, "stack", "bg-dusk", "text-moon", 249000),
  book("b16", "One Piece, tập 1", "Oda Eiichirō", "TH-0311", 19000, "band", "bg-night", "text-ember", 25000),
  book("b17", "Người giàu có nhất thành Babylon", "George S. Clason", "TH-0142", 59000, "frame", "bg-ember", "text-night", 79000),
  book("b18", "Thói quen nguyên tử", "James Clear", "TH-0388", 139000, "disc", "bg-night", "text-crescent", 179000),
];

export const storeName = (code: StoreCode) =>
  stores.find((s) => s.code === code)!.name;
