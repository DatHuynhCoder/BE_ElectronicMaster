export const normalizeString = (str) => {
  return str
    .normalize('NFD')                  // Chuyển ký tự có dấu thành ký tự base + dấu
    .replace(/[\u0300-\u036f]/g, '')   // Xóa toàn bộ dấu (diacritics)
    .replace(/đ/g, 'd')                // Xử lý riêng cho đ
    .replace(/Đ/g, 'D')
    .toLowerCase()                     // Chuyển về chữ thường
    .trim();                           // Xóa khoảng trắng đầu cuối
};