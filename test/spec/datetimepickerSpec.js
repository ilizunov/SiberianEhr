describe("Variate Date-time Picker Widget", function () {
    describe("rendering", function () {
        var view;
        beforeEach(function(){
            view = new SiberianEHR.DateTimePickerView({
                model : new SiberianEHR.DateTimePicker({
                    format: 'YYYY-MM-??',
                    Magnitude: 63494389149.55
                })
            });
            view.render();
        });

        it("In select box year should be selected", function () {
            //Test for rivets late binding
            //Fixed rivets error #75: Improve data-value bindings on dynamic select elements
            //https://github.com/adheerajkumar/rivets/commit/ee1b0980f6417ef1bf90f543a6f649cd59a69fa6
            expect(parseInt($('select[name=Year]', view.el).val())).toEqual(2013);
        });
    });
});
