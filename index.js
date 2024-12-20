const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Читаем package.json с использованием path
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));

// Получаем зависимости
const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};

// Функция для получения информации о лицензии
const getLicenses = async (packageName) => {
  try {
    const { execSync } = require('child_process');
    const result = execSync(`npm view ${packageName} license`).toString().trim();
    return result;
  } catch (error) {
    return 'Не удалось получить лицензию';
  }
};

// Основная функция
const main = async () => {
  const allDependencies = { ...dependencies, ...devDependencies };
  const licensesData = [];

  for (const [name, version] of Object.entries(allDependencies)) {
    const license = await getLicenses(name);

    console.log(`${name},${version},${license}`);

    licensesData.push({ name, version, license });
  }

  exportToExcel(licensesData, 'licenses');
};

// Экспортирует массив данных в файл Excel
function exportToExcel(data, filename = 'exported_data') {
  // Создаем worksheet из данных
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Создаем workbook и добавляем worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Генерируем файл Excel
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

main();
