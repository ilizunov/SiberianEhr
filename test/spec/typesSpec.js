describe("SiberianEHR primitive data types", function () {
    describe("DV_Quantity", function () {
        describe("Initialization", function(){
            it("Should initialize variable of specified type with default values", function(){
                var dvQuantity = new SiberianEHR.Types.DV_Quantity();
                expect(dvQuantity.magnitude).toBeNull();
                expect(dvQuantity.precision).toBeNull();
                expect(dvQuantity.units).toBeNull();
            });
            it("Should initialize variable of specified type with specified values", function(){
                var obj = {
                    magnitude: 5.5,
                    units: 'kg/m3',
                    precision: 1
                };
                var dvQuantity = new SiberianEHR.Types.DV_Quantity(obj);
                expect(dvQuantity.magnitude).toEqual(obj.magnitude);
                expect(dvQuantity.precision).toEqual(obj.precision);
                expect(dvQuantity.units).toEqual(obj.units);
            });
        });
        describe("Internal methods testing", function(){
            it("Should return whether is integral or not", function(){
                var obj = {
                    magnitude: 5.5,
                    units: 'kg/m3',
                    precision: 1
                };
                var dvQuantityF = new SiberianEHR.Types.DV_Quantity(obj);
                obj.precision = 0;
                var dvQuantityT = new SiberianEHR.Types.DV_Quantity(obj);
                expect(dvQuantityF.is_integral()).toBeFalsy();
                expect(dvQuantityT.is_integral()).toBeTruthy();
            });
        });
    });
});
