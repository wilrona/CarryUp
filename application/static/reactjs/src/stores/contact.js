const { action, decorate, observable } = mobx;

class  Contacts {
    all = [
        { id: 1, name: 'Ndi Ronald', description: 'une breve description' },
        { id: 2, name: 'Ndi Steve', description: 'une breve description' }
    ];
}

decorate(Contacts, {
    all: observable
});

export default new Contacts();