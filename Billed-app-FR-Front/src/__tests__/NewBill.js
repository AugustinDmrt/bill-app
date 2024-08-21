import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";
import router from "../app/Router";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import NewBill from "../containers/NewBill";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    window.localStorage.setItem(
      "user",
      JSON.stringify({ type: "Employee", email: "employee@test.com" })
    );

    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
  });

  describe("When I submit a new Bill", () => {
    test("Then verify the file bill", async () => {
      const newBillInit = new NewBill({
        document,
        onNavigate: (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        },
        store: mockStore,
        localStorage: window.localStorage,
      });

      await waitFor(() => {
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });

      const billFileInput = screen.getByTestId("file");
      const file = new File(["image"], "image.png", { type: "image/png" });
      userEvent.upload(billFileInput, file);

      const handleSubmit = jest.fn(newBillInit.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("When I can't upload an invalid file", () => {
    test("Then show an error message", async () => {
      const newBillInit = new NewBill({
        document,
        onNavigate: (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        },
        store: mockStore,
        localStorage: window.localStorage,
      });

      await waitFor(() => {
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });

      const billFileInput = screen.getByTestId("file");

      // Ajoutez un console.log pour voir si l'élément est bien sélectionné
      console.log(billFileInput);

      const invalidFile = new File(["document"], "document.pdf", {
        type: "application/pdf",
      });
      userEvent.upload(billFileInput, invalidFile);

      await waitFor(() => expect(billFileInput.value).toBe(""));

      // Vérifiez que le message d'erreur s'affiche
      expect(
        screen.queryByText("Seuls les fichiers jpg, jpeg et png sont acceptés.")
      ).toBeTruthy();
    });
  });
});
