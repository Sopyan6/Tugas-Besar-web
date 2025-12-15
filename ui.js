export class UI {
  constructor(manager) {
    this.manager = manager;
    this.tableBody = document.querySelector("#financeTable tbody");

    // Pasang tombol reset
    const resetBtn = document.getElementById("btnReset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetAll());
    }
  }

  render() {
    this.tableBody.innerHTML = "";
    this.manager.transactions.forEach(t => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td>Rp ${t.amount.toLocaleString()}</td>
        <td>${t.description}</td>
      `;
      this.tableBody.appendChild(row);
    });

    document.getElementById("totalIncome").textContent =
      this.manager.getTotal("income").toLocaleString();

    document.getElementById("totalOutcome").textContent =
      this.manager.getTotal("outcome").toLocaleString();

    document.getElementById("balance").textContent =
      this.manager.getBalance().toLocaleString();
  }

  // =============== RESET SEMUA DATA ==================
  resetAll() {
    // 1. Kosongkan input atas
    document.getElementById("type").value = "income";
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";

    // 2. Hapus data transaksi di manager
    this.manager.transactions = [];

    // 3. Hapus penyimpanan localStorage kalau app menyimpan data
    localStorage.removeItem("transactions");

    // 4. Render ulang tabel + summary (kosong)
    this.render();
  }
}