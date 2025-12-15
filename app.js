import { Transaction, FinanceManager } from "./finance.js";
import { UI } from "./ui.js";

const manager = new FinanceManager();
const ui = new UI(manager);

// --- Kategori Dinamis ---
const categories = {
    income: ["Gaji Bulanan", "Freelance", "Pemasukan Lainnya"],
    outcome: ["Belanja Bulanan", "Operasional Kantor", "Uang Jajan Anak", "Hiburan Mingguan", "Biaya Tak Terduga"]
};

const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");

function updateCategoryOptions() {
    categorySelect.innerHTML = "";
    categories[typeSelect.value].forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

updateCategoryOptions();
typeSelect.addEventListener("change", updateCategoryOptions);

// --- Tambah Data ---
document.getElementById("addBtn").addEventListener("click", () => {
    const type = typeSelect.value;
    const category = categorySelect.value;
    const amount = parseFloat(document.getElementById("amount").value);
    const desc = document.getElementById("description").value;

    if (!amount || amount <= 0) {
        alert("Masukkan jumlah yang valid!");
        return;
    }

    const t = new Transaction(type, category, amount, desc);
    manager.addTransaction(t);
    ui.render();
});

// --- Ekspor Excel ---
document.getElementById("exportExcel").addEventListener("click", () => {
    const data = manager.transactions.map(t => ({
        Tipe: t.type,
        Kategori: t.category,
        Jumlah: t.amount,
        Keterangan: t.description
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DataKeuangan");
    XLSX.writeFile(wb, "data_keuangan.xlsx");
});

// --- Impor Excel ---
document.getElementById("importExcel").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            // Validasi dan transformasi data
            const importedTransactions = rows.map(r => {
                try {
                    // Pastikan kolom sesuai dengan nama di sheet Excel
                    const type = r.Tipe;
                    const category = r.Kategori;
                    const amount = Number(r.Jumlah);
                    const description = r.Keterangan;

                    // Validasi data
                    if (!type || !category || isNaN(amount) || !description || description.trim() === "") {
                        throw new Error("Data tidak lengkap atau tidak valid: " + JSON.stringify(r));
                    }

                    return new Transaction(type, category, amount, description);
                } catch (error) {
                    console.error("Error memproses baris data:", error);
                    return null; // Lewati baris invalid
                }
            }).filter(t => t !== null); // Filter transaksi yang valid

            // Gantikan transaksi lama dengan yang baru
            manager.transactions = importedTransactions;
            ui.render();
        } catch (error) {
            console.error("Error membaca file Excel:", error);
            alert("Terjadi kesalahan saat membaca file Excel: " + error.message);
        }
    };
    reader.onerror = function(error) {
        console.error("Error membaca file:", error);
        alert("Terjadi kesalahan saat memuat file: " + error.message);
    };
    reader.readAsArrayBuffer(file);
});
