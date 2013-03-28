describe("Variate Date-time Picker Widget", function () {
    describe("Model initialization", function(){
        var localDateFormat, m, v;
        beforeEach(function(){
            m = 63494389149.55;
            localDateFormat = 'YYYY-MM-DD';
            v = '0001-02-03T01:23:45.678+0:00';
        });
        it("Should initialize model with year",function(){
            format = 'YYYY-XX-XX';
            var model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                    Magnitude: m,
                    format: format,
                    localDateFormat: localDateFormat
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(1);
            expect(json.Hour).toEqual(0);
            expect(json.Minute).toEqual(0);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013');
        });
        it("Should initialize model with year and month",function(){
            format = 'YYYY-MM-XX';
            var model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                    Magnitude: m,
                    format: format,
                    localDateFormat: localDateFormat
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(1);
            expect(json.Hour).toEqual(0);
            expect(json.Minute).toEqual(0);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013-01');
        });
        it("Should initialize model with year, month and day",function(){
            format = 'YYYY-MM-DD';
            var model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                    Magnitude: m,
                    format: format,
                    localDateFormat: localDateFormat
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(21);
            expect(json.Hour).toEqual(0);
            expect(json.Minute).toEqual(0);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013-01-21');
        });
        it("Should initialize model with hour",function(){
            format = 'XXXX-XX-XXTHH:XX:XX.XXX';
            var model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                    Value: v,
                    format: format
                }),
                json = model.toJSON();
            expect(json.Hour).toEqual(1);
            expect(json.Minute).toEqual(0);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getTimeValue()).toEqual('01');
        });
        it("Should initialize model with hour and minute",function(){
            format = 'XXXX-XX-XXTHH:mm:XX.XXX';
            var model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                    Value: v,
                    format: format
                }),
                json = model.toJSON();
            expect(json.Hour).toEqual(1);
            expect(json.Minute).toEqual(23);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getTimeValue()).toEqual('01:23');
        });
        it("Should initialize model with hour, minute and second",function(){
            format = 'XXXX-XX-XXTHH:mm:ss.XXX';
            var model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                    Value: v,
                    format: format
                }),
                json = model.toJSON();
            expect(json.Hour).toEqual(1);
            expect(json.Minute).toEqual(23);
            expect(json.Second).toEqual(45);
            expect(json.Millisecond).toEqual(0);
            expect(model.getTimeValue()).toEqual('01:23:45');
        });
        it("Should initialize model with hour, minute, second and millisecond",function(){
            format = 'XXXX-XX-XXTHH:mm:ss.SSS';
            var model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                    Value: v,
                    format: format
                }),
                json = model.toJSON();
            expect(json.Hour).toEqual(1);
            expect(json.Minute).toEqual(23);
            expect(json.Second).toEqual(45);
            expect(json.Millisecond).toEqual(678);
            expect(model.getTimeValue()).toEqual('01:23:45.678');
        });
    });

    describe("Model validation", function(){
        var localDateFormat, m, model, format, foo;
        beforeEach(function(){
            m = 63494389149.55;
            localDateFormat = 'YYYY-MM-DD';
            foo = {
                invalid_handler : function(){
                    return;
                },
                valid_handler: function(){
                    return;
                }
            },
            format = 'YYYY-MM-DD';
            spyOn(foo, 'invalid_handler');
            spyOn(foo, 'valid_handler');
        });
        it("Month required checking",function(){
            model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                Magnitude: m,
                localDateFormat: localDateFormat,
                format: format
            });
            model.on('invalid', foo.invalid_handler, model);
            model.setDate(new Date(), {parts:['yyyy']});
            expect(foo.invalid_handler).toHaveBeenCalled();
        });
        it("Day required checking",function(){
            model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                Magnitude: m,
                localDateFormat: localDateFormat,
                format: format
            });
            model.on('invalid', foo.invalid_handler, model);
            model.setDate(new Date(), {parts:['yyyy','mm']});
            expect(foo.invalid_handler).toHaveBeenCalled();
        });
        it("Everything is required and provided checking",function(){
            model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                Magnitude: m,
                localDateFormat: localDateFormat,
                format: format
            });
            model.on('valid', foo.valid_handler, model);
            model.setDate(new Date(), {parts:['yyyy','mm','dd']});
            expect(foo.valid_handler).toHaveBeenCalled();
        });
    });

    describe("Model serialization/deserialization", function(){
        var localDateFormat, m, model;
        beforeEach(function(){
            m = 63494389149.55;
            localDateFormat = 'DD-MM-YYYY';
        });
        it("Serialization test",function(){
            model = new SiberianEHR.DateTimePicker.DateTimePickerModel({
                format: 'YYYY-MM-DDTXX:XX:XX',
                localDateFormat: localDateFormat,
                Magnitude: 63494389149.55
            });// this is 21-01-2013, so
            var json = SiberianEHR.DateTimePicker.serialize(model);
            expect(json.Magnitude).toEqual(63494323200);
            expect(json.Value).toEqual('2013-01-21T00:00:00+00:00');
        });
        it("Deserialization test",function(){
            var json = {
                Magnitude: 63494323200,
                Value: '2013-01-21T00:00:00+00:00',
                format: 'YYYY-MM-DDTXX:XX:XX'
            };
            model = SiberianEHR.DateTimePicker.deserialize(json);
            var sjson = SiberianEHR.DateTimePicker.serialize(model);
            expect(_.isEqual(json, sjson)).toEqual(true);
        });
        it("Deserialization from string test", function(){
            var json = {
                Value: '2013-01-21T00:00:00+00:00',
                format: 'YYYY-MM-DDTXX:XX:XX'
            };
            model = SiberianEHR.DateTimePicker.deserialize(json);
            var sjson = SiberianEHR.DateTimePicker.serialize(model);
            expect(sjson.Magnitude).toEqual(63494323200);
        });
    });

    describe("Format reader parsing",function(){
        describe("Date format peader", function(){
            var fr, format;
            beforeEach(function(){
                fr = new SiberianEHR.DateTimeFormatReader();
            });
            it("Should have only year. No constraints.",function(){
                format = fr.readDateFormat('????-XX-XXTXX:XX:XX');
                expect(format.hasYear).toEqual(true);
                expect(format.hasMonth || format.hasDay).toBeFalsy();
                expect(format.isRequiredYear || format.isRequiredMonth || format.isRequiredDay).toBeFalsy();
            });
            it("Should have only year. Required constraint.",function(){
                format = fr.readDateFormat('YYYY-XX-XXTXX:XX:XX');
                expect(format.hasYear).toEqual(true);
                expect(format.hasMonth || format.hasDay).toBeFalsy();
                expect(format.isRequiredMonth || format.isRequiredDay).toBeFalsy();
                expect(format.isRequiredYear).toEqual(true);
            });
            it("Should have year and month. Year required constraint.",function(){
                format = fr.readDateFormat('YYYY-??-XXTXX:XX:XX');
                expect(format.hasYear && format.hasMonth).toEqual(true);
                expect(format.hasDay).toBeFalsy();
                expect(format.isRequiredMonth || format.isRequiredDay).toBeFalsy();
                expect(format.isRequiredYear).toEqual(true);
            });
            it("Should have year and month. Both year and month required constraint.",function(){
                format = fr.readDateFormat('YYYY-MM-XXTXX:XX:XX');
                expect(format.hasYear && format.hasMonth).toEqual(true);
                expect(format.hasDay).toBeFalsy();
                expect(format.isRequiredDay).toBeFalsy();
                expect(format.isRequiredYear && format.isRequiredMonth).toEqual(true);
            });
            it("Should have year, month and day. Year and month required constraint, day - no constraint.",function(){
                format = fr.readDateFormat('YYYY-MM-??TXX:XX:XX');
                expect(format.hasYear && format.hasMonth && format.hasDay).toEqual(true);
                expect(format.isRequiredDay).toBeFalsy();
                expect(format.isRequiredYear && format.isRequiredMonth).toEqual(true);
            });
            it("Should have year, month and day. Year, month and day required constraints.",function(){
                format = fr.readDateFormat('YYYY-MM-DDTXX:XX:XX');
                expect(format.hasYear && format.hasMonth && format.hasDay).toEqual(true);
                expect(format.isRequiredYear && format.isRequiredMonth && format.isRequiredDay).toEqual(true);
            });
        })
    });
});
